import { APIGatewayProxyEvent } from "aws-lambda";

export type APIGatewayEvent<TSchema, TBase = APIGatewayProxyEvent> = Omit<
  TBase,
  // These are the fields we currently validate. We don't want any generic
  // string-based indexing to be available on these fields. We only want to
  // see those fields that appear in our schema.
  "body" | "headers" | "pathParameters" | "queryStringParameters"
> &
  TSchema & {
    /**
     * The cookies are only available if the proper cookie parser
     * middleware has been installed in the middy framework.
     *
     * @deprecated Use a field defined in the schema of the lambda.
     */
    cookies: Partial<Record<string, string>>;
  };
