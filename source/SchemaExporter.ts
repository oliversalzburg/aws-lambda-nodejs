import { isNil } from "@oliversalzburg/js-utils/nil.js";
import { JSONSchema4 } from "json-schema";
import path from "node:path";

export abstract class SchemaExporter {
  readonly workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  nameFromCwd(fixedCwd?: string) {
    const cwd = fixedCwd ?? process.cwd();
    const basename = path.basename(cwd);
    const name = basename.replace(/^fn-/, "");
    return name;
  }

  async nameFromManifest() {
    const { default: manifest } = (await import(path.resolve(this.workspacePath, "package.json"), {
      assert: { type: "json" },
    })) as {
      default: {
        name: string;
      };
    };

    return manifest.name;
  }

  static schemaHasBody(schema: JSONSchema4) {
    return !isNil(schema.properties?.body);
  }

  static schemaHasPathParameters(schema: JSONSchema4) {
    return !isNil(schema.properties?.pathParameters);
  }
}
