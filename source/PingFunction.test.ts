import { expect } from "chai";
import { it } from "mocha";
import { PingFunction } from "./PingFunction.js";

it("can be constructed", () => {
  new PingFunction("testing");
});

it("pings", async () => {
  const func = new PingFunction("testing");
  // @ts-expect-error testing
  const result = await func.handler(null, null);
  expect(result).to.equal(null);
});
