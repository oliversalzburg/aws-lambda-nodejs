import middy from "@middy/core";
import { normalizeHttpResponse } from "@middy/util";
import { AbstractError } from "@oliversalzburg/js-utils/error/AbstractError.js";
import { InternalError } from "@oliversalzburg/js-utils/error/InternalError.js";
import { mustExist } from "@oliversalzburg/js-utils/nil.js";
import { logger } from "./AwsPowerTools.js";

const defaults = {
  // eslint-disable-next-line no-console
  logger: console.error,
};

/**
 * Constructs a new error handler middleware.
 * @param opts - The options for the error handler middleware.
 * @returns A middyjs middleware to handle errors.
 */
export const errorHandlerMiddleware = (opts = {}) => {
  const options = { ...defaults, ...opts };

  const errorHandlerMiddlewareOnError = (request: middy.Request) => {
    logger.info(`Error handler middleware invoked. Response type is '${typeof request.response}'.`);

    if (request.response !== undefined) return;
    if (typeof options.logger === "function") {
      options.logger(request.error);
    }

    const error = mustExist(request.error) as AbstractError;
    if (!AbstractError.isAbstractError(error)) {
      // Caught error, but not AbstractError. Returning from handler.
      return;
    }

    const exposeError = error.status < 500;
    const subjectError = exposeError ? error : new InternalError("Internal Server Error");

    const serializedError = JSON.stringify({
      code: subjectError.code,
      detail: subjectError.cause,
      name: subjectError.name,
      message: subjectError.message,
    });
    normalizeHttpResponse(request);
    request.response = {
      statusCode: error.status,
      body: serializedError,
      headers: {
        ...(request.response as { headers?: Record<string, string> } | null)?.headers,
        "Content-Type": "application/json",
      },
    };
  };

  return {
    onError: errorHandlerMiddlewareOnError,
  };
};
export default errorHandlerMiddleware;
