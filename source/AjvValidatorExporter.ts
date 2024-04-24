import { coalesceArray } from "@oliversalzburg/js-utils";
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";
import { pascalCase } from "change-case";
import { JSONSchema4 } from "json-schema";
import path from "node:path";
import { format } from "prettier";
import { SchemaExporter } from "./SchemaExporter.js";

export class AjvValidatorExporter extends SchemaExporter {
  async export() {
    const name = this.nameFromCwd(this.workspacePath);
    const lambdaName = pascalCase(name);

    // We assume outputs have been compiled.
    const schemaPath = path.resolve(this.workspacePath, "./schema.js");
    const schema = (await import(schemaPath)) as {
      contextSchema?: JSONSchema4;
      environmentSchema?: JSONSchema4;
      eventSchema?: JSONSchema4;
      responseSchema?: JSONSchema4;
    };

    const validationSchemas: {
      contextSchema?: "#/definitions/contextSchema";
      environmentSchema?: "#/definitions/environmentSchema";
      eventSchema?: "#/definitions/eventSchema";
      responseSchema?: "#/definitions/responseSchema";
    } = {};

    if (!schema.environmentSchema) {
      process.stderr.write(
        `ERROR: Missing \`environmentSchema\` export in schema for ${lambdaName}. Environment schema is REQUIRED.\n`,
      );
      return;
    }
    validationSchemas.environmentSchema = "#/definitions/environmentSchema";
    schema.environmentSchema.$id = "#/definitions/environmentSchema";
    schema.environmentSchema.$schema = "http://json-schema.org/draft-07/schema#";

    // We don't really care about missing context schema, as we hardly ever use the context.
    if (schema.contextSchema) {
      validationSchemas.contextSchema = "#/definitions/contextSchema";
      schema.contextSchema.$id = "#/definitions/contextSchema";
      schema.contextSchema.$schema = "http://json-schema.org/draft-07/schema#";
    }

    if (!schema.eventSchema) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (schema.eventSchema === undefined) {
        process.stderr.write(`WARN: Missing \`eventSchema\` export in schema for ${lambdaName}\n`);
      }
    } else {
      validationSchemas.eventSchema = "#/definitions/eventSchema";
      schema.eventSchema.$id = "#/definitions/eventSchema";
      schema.eventSchema.$schema = "http://json-schema.org/draft-07/schema#";
    }

    if (!schema.responseSchema) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (schema.responseSchema === undefined) {
        process.stderr.write(
          `WARN: Missing \`responseSchema\` export in schema for ${lambdaName}\n`,
        );
      }
    } else {
      validationSchemas.responseSchema = "#/definitions/responseSchema";
      schema.responseSchema.$id = "#/definitions/responseSchema";
      schema.responseSchema.$schema = "http://json-schema.org/draft-07/schema#";
    }

    const ajv = new Ajv({
      code: { esm: true, source: true },
      schemas: coalesceArray([
        schema.contextSchema,
        schema.environmentSchema,
        schema.eventSchema,
        schema.responseSchema,
      ]),
    });

    const moduleCode = standaloneCode(ajv, validationSchemas);

    const formattedCode = await format(moduleCode, { parser: "babel" });

    process.stdout.write(formattedCode);
  }
}
