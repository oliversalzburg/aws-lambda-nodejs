/* eslint-disable no-unused-expressions */
import { Context } from "aws-lambda";
import { expect } from "chai";
import { it } from "mocha";
import { ApiGatewayRequest } from "./ApiGatewayRequest.js";
import { PingFunction } from "./PingFunction.js";

it("can be constructed", () => {
  new PingFunction("testing");
});

it("pings", async () => {
  const func = new PingFunction("testing");
  const now = new Date().getTime();
  const result = await func.handler(
    ApiGatewayRequest.from({ ping: now }, {}, {}, {}),
    {} as Context,
  );
  expect(result).to.exist;
  expect(result.body.message).to.equal("testing");
  expect(result.body.ping).to.equal(now);
  expect(result.body.pong).to.be.a("number");
  expect(result.body.pong).to.be.greaterThanOrEqual(now);
});
