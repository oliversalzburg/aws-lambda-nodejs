import { LambdaInterface } from "@aws-lambda-powertools/commons";
import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import { logMetrics } from "@aws-lambda-powertools/metrics";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import middy from "@middy/core";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import httpSecurityHeaders from "@middy/http-security-headers";
import secretsManager from "@middy/secrets-manager";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { InvalidOperationError } from "@oliversalzburg/js-utils/error/InvalidOperationError.js";
import { isNil, mustExist } from "@oliversalzburg/js-utils/nil.js";
import { logger, metrics, tracer } from "./AwsPowerTools.js";
import errorHandlerMiddleware from "./ErrorHandlerMiddleware.js";

export interface LambdaHandlerOptions {
  /**
   * From which AWS region should secrets from the Secrets Manager service be retrieved?
   * You only need to specify this if you want to use `secretsToFetch`.
   * This is usually your default region.
   */
  readonly awsSecretsRegion?: string;

  /**
   * Does this Lambda handle HTTP events?
   */
  readonly isHttpHandler?: boolean;

  /**
   * From which public URLs can this Lambda be called?
   * We will use this for CORS replies.
   */
  readonly publicUrls?: string;

  /**
   * A JSON schema describing the `context` object of a Lambda handler.
   */
  readonly schemaContext?: Record<string, unknown>;

  /**
   * A JSON schema describing the `event` object of a Lambda handler.
   */
  readonly schemaEvent?: Record<string, unknown>;

  /**
   * A JSON schema describing the result of a Lambda handler.
   */
  readonly schemaResult?: Record<string, unknown>;

  /**
   * Which secrets, if any, should be fetched from Secrets Manager, and be made available
   * on the `context` of your event handler?
   */
  readonly secretsToFetch?: Record<string, string>;
}

export function makeLambdaHandler(
  handlerClassInstance: LambdaInterface,
  options?: LambdaHandlerOptions,
) {
  const boundHandler = handlerClassInstance.handler.bind(handlerClassInstance);

  let middyHandler = middy(boundHandler)
    .use(captureLambdaHandler(tracer))
    .use(logMetrics(metrics, { captureColdStartMetric: true }))
    .use(injectLambdaContext(logger, { clearState: true }));

  if (options?.isHttpHandler === undefined || options.isHttpHandler) {
    middyHandler = middyHandler
      .use(httpEventNormalizer())
      .use(httpHeaderNormalizer())
      .use(httpSecurityHeaders())
      .use(
        httpResponseSerializer({
          serializers: [
            {
              regex: /^application\/json$/,
              serializer: ({ body }) => JSON.stringify(body),
            },
          ],
          defaultContentType: "application/json",
        }),
      );
  }

  // Check if the passed event schema has a `body` property.
  // If so, ensure the body is parsed as JSON.
  if (!isNil((options?.schemaEvent?.properties as Record<string, unknown> | null)?.body)) {
    middyHandler = middyHandler.use(httpJsonBodyParser({ disableContentTypeError: false }));
  }

  if (
    !isNil(options?.schemaContext) ||
    !isNil(options?.schemaEvent) ||
    !isNil(options?.schemaResult)
  ) {
    const { schemaContext, schemaEvent, schemaResult } = mustExist(options);

    middyHandler = middyHandler.use(
      validator({
        contextSchema: !isNil(schemaContext) ? transpileSchema(schemaContext) : undefined,
        eventSchema: !isNil(schemaEvent) ? transpileSchema(schemaEvent) : undefined,
        responseSchema: !isNil(schemaResult) ? transpileSchema(schemaResult) : undefined,
      }),
    );
  }

  if (!isNil(options?.secretsToFetch)) {
    const region = options?.awsSecretsRegion;
    if (isNil(region)) {
      throw new InvalidOperationError(
        "Unable to retrieve secrets without specifying region to retrieve from.",
      );
    }

    middyHandler = middyHandler.use(
      secretsManager({
        awsClientCapture: tracer.captureAWSv3Client.bind(tracer),
        awsClientOptions: {
          region,
        },
        cacheExpiry: 30 * 1000,
        disablePrefetch: true,
        fetchData: options?.secretsToFetch,
      }),
    );
  }

  // Error handling. Note that handlers are called in reverse attachment order.
  if (options?.isHttpHandler === undefined || options.isHttpHandler) {
    middyHandler = middyHandler
      // Register the CORS middleware after the error handlers, to ensure that
      // even error responses receive our desired CORS headers.
      .use(
        cors({
          headers: [
            // CORS-safelisted request headers.
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
          ].join(","),
          origins: options?.publicUrls?.split(",") ?? [],
        }),
      )

      // Handle all other errors.
      .use(httpErrorHandler({ logger: logger.error.bind(logger) }));
  }
  // Handle AbstractError.
  middyHandler = middyHandler.use(errorHandlerMiddleware({ logger: logger.error.bind(logger) }));

  return middyHandler;
}
