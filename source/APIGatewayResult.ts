import { APIGatewayProxyResult } from "aws-lambda";

export type APIGatewayResult<TSchema> = Omit<
  APIGatewayProxyResult,
  // We currently only validated the response body.
  "body"
> &
  TSchema;
