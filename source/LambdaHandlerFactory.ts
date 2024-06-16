import { injectLambdaContext } from "@aws-lambda-powertools/logger/middleware";
import { logMetrics } from "@aws-lambda-powertools/metrics/middleware";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer/middleware";
import middy, { MiddyHandlerObject } from "@middy/core";
import eventNormalizer from "@middy/event-normalizer";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import httpSecurityHeaders from "@middy/http-security-headers";
import secretsManager from "@middy/secrets-manager";
import validator from "@middy/validator";
import { InvalidOperationError } from "@oliversalzburg/js-utils/error/InvalidOperationError.js";
import { isNil, mustExist } from "@oliversalzburg/js-utils/nil.js";
import { Context } from "aws-lambda";
import { logger, metrics, tracer } from "./AwsPowerTools.js";
import errorHandlerMiddleware from "./ErrorHandlerMiddleware.js";

/**
 * Handler for a Lambda integration event.
 */
export type Handler<TEvent, TResult, TContext> = (
  event: TEvent,
  context: TContext,
  opts: MiddyHandlerObject,
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
) => void | Promise<TResult>;

/**
 * A synchronous handler for a Lambda integration event.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SyncHandler<THandler extends Handler<any, any, any>> = (
  event: Parameters<THandler>[0],
  context: Parameters<THandler>[1],
  opts: MiddyHandlerObject,
) => ReturnType<THandler>;
/**
 * An asynchronous handler for a Lambda integration event.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AsyncHandler<THandler extends Handler<any, any, any>> = (
  event: Parameters<THandler>[0],
  context: Parameters<THandler>[1],
  opts: MiddyHandlerObject,
) => ReturnType<THandler>;
/**
 * The generic Lambda interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LambdaInterface<E = any, R = any, C = any> {
  /**
   * The generic Lambda function request handler.
   */
  handler: SyncHandler<Handler<E, R, C>> | AsyncHandler<Handler<E, R, C>>;
}

/**
 * Options for constructing the new Lambda event handler.
 */
export interface LambdaHandlerOptions<
  TSecrets extends Record<string, string> | undefined = undefined,
> {
  /**
   * From which AWS region should secrets from the Secrets Manager service be retrieved?
   * You only need to specify this if you want to use `secretsToFetch`.
   * This is usually your default region.
   */
  readonly awsSecretsRegion?: string;

  /**
   * Does this Lambda handle HTTP events?
   */
  readonly isHttpHandler?: true | "readonly";

  /**
   * From which public URLs can this Lambda be called?
   * We will use this for CORS replies.
   */
  readonly publicUrls?: string;

  /**
   * A function that validates the context object.
   * This is expected to be a precompiled Ajv validator.
   * See https://middy.js.org/docs/middlewares/validator/ for details.
   */
  readonly schemaContextValidator?: AjvPrecompiledValidator;

  /**
   * A function that validates the event object the lambda receives.
   * This is expected to be a precompiled Ajv validator.
   * See https://middy.js.org/docs/middlewares/validator/ for details.
   */
  readonly schemaEventValidator?: AjvPrecompiledValidator;

  /**
   * A function that validates the response object of the lambda.
   * This is expected to be a precompiled Ajv validator.
   * See https://middy.js.org/docs/middlewares/validator/ for details.
   */
  readonly schemaResultValidator?: AjvPrecompiledValidator;

  /**
   * Which secrets, if any, should be fetched from Secrets Manager, and be made available
   * on the `context` of your event handler?
   */
  readonly secretsToFetch?: TSecrets;
}

/**
 * Builds a new Lambda handler function.
 * @param handlerClassInstance - An instance of a Lambda handler.
 * @param options - Construction options for the factory.
 * @returns The final Lambda handler.
 */
export function makeLambdaHandler<
  TEvent,
  TResult,
  TSecrets extends Record<string, string>,
  TOptions extends LambdaHandlerOptions<TSecrets>,
  TContext extends Context &
    (TOptions extends { secretsToFetch: TSecrets } ? { [key in keyof TSecrets]: string } : never),
>(handlerClassInstance: LambdaInterface<TEvent, TResult, TContext>, options?: TOptions) {
  const boundHandler = handlerClassInstance.handler.bind(handlerClassInstance);

  let middyHandler = middy<TEvent, TResult, Error, TContext>(boundHandler)
    .use(captureLambdaHandler(tracer))
    .use(logMetrics(metrics, { captureColdStartMetric: true }))
    .use(injectLambdaContext(logger, { clearState: true }));

  if (options?.isHttpHandler) {
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
      ) as typeof middyHandler;

    if (options.isHttpHandler !== "readonly") {
      middyHandler = middyHandler.use(
        httpJsonBodyParser({ disableContentTypeError: false }),
      ) as typeof middyHandler;
    }
  } else {
    middyHandler = middyHandler.use(eventNormalizer());
  }

  if (!isNil(options?.secretsToFetch)) {
    const region = options.awsSecretsRegion;
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
        fetchData: options.secretsToFetch,
        setToContext: true,
      }),
    ) as typeof middyHandler;
  }

  if (
    !isNil(options?.schemaContextValidator) ||
    !isNil(options?.schemaEventValidator) ||
    !isNil(options?.schemaResultValidator)
  ) {
    const { schemaContextValidator, schemaEventValidator, schemaResultValidator } =
      mustExist(options);

    middyHandler = middyHandler.use(
      validator({
        contextSchema: schemaContextValidator,
        eventSchema: schemaEventValidator,
        responseSchema: schemaResultValidator,
      }),
    );
  }

  // Error handling. Note that handlers are called in reverse attachment order.
  if (options?.isHttpHandler) {
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
          origins: options.publicUrls?.split(",") ?? [],
        }),
      )

      // Handle all other errors.
      .use(httpErrorHandler({ logger: logger.error.bind(logger) }));
  }
  // Handle AbstractError.
  middyHandler = middyHandler.use(
    errorHandlerMiddleware({ logger: logger.error.bind(logger) }),
  ) as typeof middyHandler;

  return middyHandler;
}
