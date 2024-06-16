import { APIGatewayProxyResult } from "aws-lambda";

/**
 * Defines a result you'd want to return to an API Gateway integration.
 */
export type APIGatewayResult<TSchema> = Omit<
  APIGatewayProxyResult,
  // We currently only validated the response body.
  "body"
> &
  TSchema;
