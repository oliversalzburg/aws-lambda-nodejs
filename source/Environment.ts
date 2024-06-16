import { InvalidArgumentError } from "@oliversalzburg/js-utils";
import { mustExist } from "@oliversalzburg/js-utils/nil.js";
import Ajv, { Schema } from "ajv";

const ajv = new Ajv({ allErrors: true, coerceTypes: "array" });

/**
 * Read all variables from the environment, validated against the given schema.
 * @param name - A name that identifies the current environment.
 * This is intended to help finding the origin of errors thrown by this function.
 * @param schema - The schema to validate the environment against.
 * @param env - The current process environment.
 * @returns The validated environment variables.
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
      } catch (_error) {
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
