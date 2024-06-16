import { redirectErrorsToConsole } from "@oliversalzburg/js-utils";
import esbuild from "esbuild";

esbuild
  .build({
    bundle: true,
    entryPoints: ["./source/main.ts"],
    format: "esm",
    outfile: "./output/main.js",
    platform: "node",
    sourcemap: true,
    target: "node20",
  })
  .catch(redirectErrorsToConsole(console));
