import { isNil } from "@oliversalzburg/js-utils/data/nil.js";
import { JSONSchema4 } from "json-schema";
import path from "node:path";

/**
 * A SchemaExporter exports schemata for projects.
 */
export abstract class SchemaExporter {
  /**
   * The path of the workspace we're operating in.
   */
  readonly workspacePath: string;

  /**
   * Constructs a new SchemaExporter.
   * @param workspacePath - The root folder of the workspace we're operating in.
   */
  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  /**
   * Get the name of the module from the current working directory.
   * @param fixedCwd - The working directory to use. The default is the current
   * working directory of the process.
   * @returns A name that can be used to identify this module.
   */
  nameFromCwd(fixedCwd?: string): string {
    const cwd = fixedCwd ?? process.cwd();
    const basename = path.basename(cwd);
    const name = basename.replace(/^fn-/, "");
    return name;
  }

  /**
   * Get the name of the module from the manifest of the module.
   * @returns A name that can be used to identify this module.
   */
  async nameFromManifest(): Promise<string> {
    const { default: manifest } = (await import(path.resolve(this.workspacePath, "package.json"), {
      assert: { type: "json" },
    })) as {
      default: {
        name: string;
      };
    };

    return manifest.name;
  }

  /**
   * Determine if the given schema defines a `body`.
   * @param schema - The schema to check.
   * @returns `true` if the schema has a body; `false` otherwise.
   */
  static schemaHasBody(schema: JSONSchema4) {
    return !isNil(schema.properties?.body);
  }

  /**
   * Determine if the given schema defines a `pathParameters`.
   * @param schema - The schema to check.
   * @returns `true` if the schema has path parameters; `false` otherwise.
   */
  static schemaHasPathParameters(schema: JSONSchema4) {
    return !isNil(schema.properties?.pathParameters);
  }
}
