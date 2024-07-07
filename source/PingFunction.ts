import { sleep } from "@oliversalzburg/js-utils/async/async.js";
import { Context } from "aws-lambda";
import { logger } from "./AwsPowerTools.js";
import { LambdaInterface } from "./LambdaHandlerFactory.js";
import { PingFunctionEvent, PingFunctionResult } from "./schema.js";

/**
 * The main implementation of the Lambda function.
 */
export class PingFunction implements LambdaInterface {
  /**
   * A message that we'll attach to our responses.
   */
  #message: string | undefined;

  /**
   * Construct a new ping function.
   * @param message - A message we'll attach to our responses.
   */
  constructor(message?: string) {
    this.#message = message;
  }

  /**
   * Handles a single request to the Lambda function.
   * @param event - The event object received from the Lambda invocation.
   * @param _context - The Lambda invocation context.
   * @returns The result of the invocation.
   */
  async handler(event: PingFunctionEvent, _context: Context): Promise<PingFunctionResult> {
    logger.debug("Accepted new PING request.");

    const now = new Date().getTime();

    logger.info(`Incoming PING request with timestamp: '${event.body.ping.toString()}'`);

    await sleep(1);

    return {
      body: {
        message: this.#message,
        ping: event.body.ping,
        pong: now,
      },
      headers: {
        "Cache-Control": "no-cache; max-age: 0;",
      },
      statusCode: 200,
    };
  }
}
