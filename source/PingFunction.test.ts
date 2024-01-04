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
  const result = await func.handler(ApiGatewayRequest.from({ ping: 0 }, {}, {}, {}), {} as Context);
  expect(result).to.exist;
  expect(result.body.message).to.equal("testing");
  expect(result.body.pong).to.be.a("number");
});
