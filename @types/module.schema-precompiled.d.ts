declare interface AjvPrecompiledValidator {
  errors?: Array<{ message: string }>;
  (subject: unknown): boolean;
}

declare module "*/schema-precompiled.js" {
  export const contextSchema: AjvPrecompiledValidator | undefined;
  export const environmentSchema: AjvPrecompiledValidator;
  export const eventSchema: AjvPrecompiledValidator | undefined;
  export const responseSchema: AjvPrecompiledValidator | undefined;
}
