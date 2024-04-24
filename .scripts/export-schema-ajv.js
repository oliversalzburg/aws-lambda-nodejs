#!/usr/bin/env node

import path from "node:path";
import { AjvValidatorExporter } from "../output/AjvValidatorExporter.js";

const workspace = path.resolve(process.cwd(), process.argv[2]);
const exporter = new AjvValidatorExporter(workspace);
exporter.export(process.argv[3] ? Number(process.argv[3]) : 4);
