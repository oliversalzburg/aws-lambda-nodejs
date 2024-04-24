import { getEnvironment } from "./Environment.js";
import { makeLambdaHandler } from "./LambdaHandlerFactory.js";
import { PingFunction } from "./PingFunction.js";
import { environmentSchema, eventSchema, responseSchema } from "./schema-precompiled.js";
import { PingFunctionEnvironment } from "./schema.js";

const env = getEnvironment<PingFunctionEnvironment>("PingFunction", environmentSchema);
const handlerClass = new PingFunction("Hello world");

const handler = makeLambdaHandler(handlerClass, {
  awsSecretsRegion: env.AWS_SECRETS_REGION,
  isHttpHandler: true,
  publicUrls: env.PUBLIC_URLS,
  schemaEventValidator: eventSchema,
  schemaResultValidator: responseSchema,
});

export { handler };
