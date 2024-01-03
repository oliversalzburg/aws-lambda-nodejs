import { FromSchema } from "json-schema-to-ts";
import { APIGatewayEvent } from "./APIGatewayEvent.js";
import { APIGatewayResult } from "./APIGatewayResult.js";

export const PingFunctionEventSchema = {
  properties: {
    body: {
      additionalProperties: false,
      properties: {
        ping: {
          description:
            "The local time of the client when the message was generated, as a UNIX timestamp.",
          type: "number",
        },
      },
      required: ["ping"],
      type: "object",
    },
  },
  required: ["body"],
  type: "object",
} as const;
export const eventSchema = PingFunctionEventSchema;

export const PingFunctionResultSchema = {
  properties: {
    body: {
      additionalProperties: false,
      properties: {
        message: {
          description: "Only for informational purposes.",
          type: "string",
        },
        pong: {
          description: "The time at which the ping reached the API, as a UNIX timestamp.",
          type: "number",
        },
      },
      required: ["pong"],
      type: "object",
    },
  },
  required: ["body"],
  type: "object",
} as const;
export const responseSchema = PingFunctionResultSchema;

export const PingFunctionEnvironmentSchema = {
  properties: {
    AWS_SECRETS_REGION: {
      description: "The AWS region where we store our secrets.",
      type: "string",
    },
    PUBLIC_URLS: {
      description:
        "A list of comma-separated, public URLs which we'll accept as an origin for CORS. Specify `*` to allow any origin.",
      type: "string",
    },
  },
  required: ["AWS_SECRETS_REGION", "PUBLIC_URLS"],
  type: "object",
  additionalProperties: true,
} as const;

export type PingFunctionEvent = APIGatewayEvent<FromSchema<typeof PingFunctionEventSchema>>;
export type PingFunctionResult = APIGatewayResult<FromSchema<typeof PingFunctionResultSchema>>;
export type PingFunctionEnvironment = FromSchema<typeof PingFunctionEnvironmentSchema>;
