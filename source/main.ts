import { getEnvironment } from "./Environment.js";
import { makeLambdaHandler } from "./LambdaHandlerFactory.js";
import { PingFunction } from "./PingFunction.js";
import {
  PingFunctionEnvironment,
  PingFunctionEnvironmentSchema,
  PingFunctionEventSchema,
  PingFunctionResultSchema,
} from "./schema.js";

const env = getEnvironment<PingFunctionEnvironment>("PingFunction", PingFunctionEnvironmentSchema);
const handlerClass = new PingFunction("Hello world");

const handler = makeLambdaHandler(handlerClass, {
  awsSecretsRegion: env.AWS_SECRETS_REGION,
  publicUrls: env.PUBLIC_URLS,
  schemaEvent: PingFunctionEventSchema,
  schemaResult: PingFunctionResultSchema,
});

export { handler };
