import { sleep } from "@oliversalzburg/js-utils/async.js";
import { Context } from "aws-lambda";
import { logger } from "./AwsPowerTools.js";
import { LambdaInterface } from "./LambdaHandlerFactory.js";
import { PingFunctionEvent, PingFunctionResult } from "./schema.js";

export class PingFunction implements LambdaInterface {
  /**
   * A message that we'll attach to our responses.
   */
  #message: string | undefined;

  /**
   * Construct a new ping function.
   * @param message A message we'll attach to our responses.
   */
  constructor(message?: string) {
    this.#message = message;
  }

  async handler(event: PingFunctionEvent, context: Context): Promise<PingFunctionResult> {
    logger.debug("Accepted new PING request.");

    const now = new Date().getTime();

    logger.info(`Incoming PING request with timestamp: '${event.body.ping}'`);

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
