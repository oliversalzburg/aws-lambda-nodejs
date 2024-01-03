import { InvalidArgumentError } from "@oliversalzburg/js-utils";
import { mustExist } from "@oliversalzburg/js-utils/nil.js";
import Ajv, { Schema } from "ajv";

const ajv = new Ajv({ allErrors: true, coerceTypes: "array" });

/**
 * read the environment from process.env given the environment json schema
 * @param schema
 * @param env
 */
export const getEnvironment = function <T = unknown>(
  name: string,
  schema: Schema,
  env = process.env,
): T {
  const validate = ajv.compile(schema);

  const parsedEnv: Record<string, unknown> = {};
  Object.keys(env).forEach(key => {
    const value = env[key];
    if (value !== undefined) {
      try {
        parsedEnv[key] = JSON.parse(value);
      } catch (err) {
        // try again, if value is a simple string
        parsedEnv[key] = JSON.parse(JSON.stringify(value));
      }
    }
  });

  if (validate(parsedEnv)) {
    return parsedEnv as T;
  }

  throw new InvalidArgumentError(
    `${name}: ${mustExist(validate.errors)
      .map(error => error.message)
      .join("\n")}`,
  );
};
