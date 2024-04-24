"use strict";
export const environmentSchema = validate10;
const schema11 = {
  properties: {
    AWS_SECRETS_REGION: {
      description: "The AWS region where we store our secrets.",
      type: "string",
    },
    PUBLIC_URLS: {
      description:
        "A list of comma-separated, public URLs which we'll accept as an origin for CORS. Specify `*` to allow any origin.",
      type: "string",
    },
  },
  required: ["AWS_SECRETS_REGION", "PUBLIC_URLS"],
  type: "object",
  additionalProperties: true,
  $id: "#/definitions/environmentSchema",
  $schema: "http://json-schema.org/draft-07/schema#",
};
function validate10(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {},
) {
  /*# sourceURL="#/definitions/environmentSchema" */ let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (
        (data.AWS_SECRETS_REGION === undefined &&
          (missing0 = "AWS_SECRETS_REGION")) ||
        (data.PUBLIC_URLS === undefined && (missing0 = "PUBLIC_URLS"))
      ) {
        validate10.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        if (data.AWS_SECRETS_REGION !== undefined) {
          const _errs2 = errors;
          if (typeof data.AWS_SECRETS_REGION !== "string") {
            validate10.errors = [
              {
                instancePath: instancePath + "/AWS_SECRETS_REGION",
                schemaPath: "#/properties/AWS_SECRETS_REGION/type",
                keyword: "type",
                params: { type: "string" },
                message: "must be string",
              },
            ];
            return false;
          }
          var valid0 = _errs2 === errors;
        } else {
          var valid0 = true;
        }
        if (valid0) {
          if (data.PUBLIC_URLS !== undefined) {
            const _errs4 = errors;
            if (typeof data.PUBLIC_URLS !== "string") {
              validate10.errors = [
                {
                  instancePath: instancePath + "/PUBLIC_URLS",
                  schemaPath: "#/properties/PUBLIC_URLS/type",
                  keyword: "type",
                  params: { type: "string" },
                  message: "must be string",
                },
              ];
              return false;
            }
            var valid0 = _errs4 === errors;
          } else {
            var valid0 = true;
          }
        }
      }
    } else {
      validate10.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate10.errors = vErrors;
  return errors === 0;
}
export const eventSchema = validate11;
const schema12 = {
  properties: {
    body: {
      additionalProperties: false,
      properties: {
        ping: {
          description:
            "The local time of the client when the message was generated, as a UNIX timestamp.",
          minimum: 0,
          type: "number",
        },
      },
      required: ["ping"],
      type: "object",
    },
  },
  required: ["body"],
  type: "object",
  $id: "#/definitions/eventSchema",
  $schema: "http://json-schema.org/draft-07/schema#",
};
function validate11(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {},
) {
  /*# sourceURL="#/definitions/eventSchema" */ let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.body === undefined && (missing0 = "body")) {
        validate11.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        if (data.body !== undefined) {
          let data0 = data.body;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
              let missing1;
              if (data0.ping === undefined && (missing1 = "ping")) {
                validate11.errors = [
                  {
                    instancePath: instancePath + "/body",
                    schemaPath: "#/properties/body/required",
                    keyword: "required",
                    params: { missingProperty: missing1 },
                    message: "must have required property '" + missing1 + "'",
                  },
                ];
                return false;
              } else {
                const _errs3 = errors;
                for (const key0 in data0) {
                  if (!(key0 === "ping")) {
                    validate11.errors = [
                      {
                        instancePath: instancePath + "/body",
                        schemaPath: "#/properties/body/additionalProperties",
                        keyword: "additionalProperties",
                        params: { additionalProperty: key0 },
                        message: "must NOT have additional properties",
                      },
                    ];
                    return false;
                    break;
                  }
                }
                if (_errs3 === errors) {
                  if (data0.ping !== undefined) {
                    let data1 = data0.ping;
                    const _errs4 = errors;
                    if (errors === _errs4) {
                      if (typeof data1 == "number" && isFinite(data1)) {
                        if (data1 < 0 || isNaN(data1)) {
                          validate11.errors = [
                            {
                              instancePath: instancePath + "/body/ping",
                              schemaPath:
                                "#/properties/body/properties/ping/minimum",
                              keyword: "minimum",
                              params: { comparison: ">=", limit: 0 },
                              message: "must be >= 0",
                            },
                          ];
                          return false;
                        }
                      } else {
                        validate11.errors = [
                          {
                            instancePath: instancePath + "/body/ping",
                            schemaPath:
                              "#/properties/body/properties/ping/type",
                            keyword: "type",
                            params: { type: "number" },
                            message: "must be number",
                          },
                        ];
                        return false;
                      }
                    }
                  }
                }
              }
            } else {
              validate11.errors = [
                {
                  instancePath: instancePath + "/body",
                  schemaPath: "#/properties/body/type",
                  keyword: "type",
                  params: { type: "object" },
                  message: "must be object",
                },
              ];
              return false;
            }
          }
        }
      }
    } else {
      validate11.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate11.errors = vErrors;
  return errors === 0;
}
export const responseSchema = validate12;
const schema13 = {
  properties: {
    body: {
      additionalProperties: false,
      properties: {
        message: {
          description: "Only for informational purposes.",
          type: "string",
        },
        ping: {
          description:
            "The time that was provided with the incoming ping signal.",
          minimum: 0,
          type: "number",
        },
        pong: {
          description:
            "The time at which the ping reached the API, as a UNIX timestamp.",
          type: "number",
        },
      },
      required: ["ping", "pong"],
      type: "object",
    },
  },
  required: ["body"],
  type: "object",
  $id: "#/definitions/responseSchema",
  $schema: "http://json-schema.org/draft-07/schema#",
};
function validate12(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {},
) {
  /*# sourceURL="#/definitions/responseSchema" */ let vErrors = null;
  let errors = 0;
  if (errors === 0) {
    if (data && typeof data == "object" && !Array.isArray(data)) {
      let missing0;
      if (data.body === undefined && (missing0 = "body")) {
        validate12.errors = [
          {
            instancePath,
            schemaPath: "#/required",
            keyword: "required",
            params: { missingProperty: missing0 },
            message: "must have required property '" + missing0 + "'",
          },
        ];
        return false;
      } else {
        if (data.body !== undefined) {
          let data0 = data.body;
          const _errs1 = errors;
          if (errors === _errs1) {
            if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
              let missing1;
              if (
                (data0.ping === undefined && (missing1 = "ping")) ||
                (data0.pong === undefined && (missing1 = "pong"))
              ) {
                validate12.errors = [
                  {
                    instancePath: instancePath + "/body",
                    schemaPath: "#/properties/body/required",
                    keyword: "required",
                    params: { missingProperty: missing1 },
                    message: "must have required property '" + missing1 + "'",
                  },
                ];
                return false;
              } else {
                const _errs3 = errors;
                for (const key0 in data0) {
                  if (
                    !(key0 === "message" || key0 === "ping" || key0 === "pong")
                  ) {
                    validate12.errors = [
                      {
                        instancePath: instancePath + "/body",
                        schemaPath: "#/properties/body/additionalProperties",
                        keyword: "additionalProperties",
                        params: { additionalProperty: key0 },
                        message: "must NOT have additional properties",
                      },
                    ];
                    return false;
                    break;
                  }
                }
                if (_errs3 === errors) {
                  if (data0.message !== undefined) {
                    const _errs4 = errors;
                    if (typeof data0.message !== "string") {
                      validate12.errors = [
                        {
                          instancePath: instancePath + "/body/message",
                          schemaPath:
                            "#/properties/body/properties/message/type",
                          keyword: "type",
                          params: { type: "string" },
                          message: "must be string",
                        },
                      ];
                      return false;
                    }
                    var valid1 = _errs4 === errors;
                  } else {
                    var valid1 = true;
                  }
                  if (valid1) {
                    if (data0.ping !== undefined) {
                      let data2 = data0.ping;
                      const _errs6 = errors;
                      if (errors === _errs6) {
                        if (typeof data2 == "number" && isFinite(data2)) {
                          if (data2 < 0 || isNaN(data2)) {
                            validate12.errors = [
                              {
                                instancePath: instancePath + "/body/ping",
                                schemaPath:
                                  "#/properties/body/properties/ping/minimum",
                                keyword: "minimum",
                                params: { comparison: ">=", limit: 0 },
                                message: "must be >= 0",
                              },
                            ];
                            return false;
                          }
                        } else {
                          validate12.errors = [
                            {
                              instancePath: instancePath + "/body/ping",
                              schemaPath:
                                "#/properties/body/properties/ping/type",
                              keyword: "type",
                              params: { type: "number" },
                              message: "must be number",
                            },
                          ];
                          return false;
                        }
                      }
                      var valid1 = _errs6 === errors;
                    } else {
                      var valid1 = true;
                    }
                    if (valid1) {
                      if (data0.pong !== undefined) {
                        let data3 = data0.pong;
                        const _errs8 = errors;
                        if (!(typeof data3 == "number" && isFinite(data3))) {
                          validate12.errors = [
                            {
                              instancePath: instancePath + "/body/pong",
                              schemaPath:
                                "#/properties/body/properties/pong/type",
                              keyword: "type",
                              params: { type: "number" },
                              message: "must be number",
                            },
                          ];
                          return false;
                        }
                        var valid1 = _errs8 === errors;
                      } else {
                        var valid1 = true;
                      }
                    }
                  }
                }
              }
            } else {
              validate12.errors = [
                {
                  instancePath: instancePath + "/body",
                  schemaPath: "#/properties/body/type",
                  keyword: "type",
                  params: { type: "object" },
                  message: "must be object",
                },
              ];
              return false;
            }
          }
        }
      }
    } else {
      validate12.errors = [
        {
          instancePath,
          schemaPath: "#/type",
          keyword: "type",
          params: { type: "object" },
          message: "must be object",
        },
      ];
      return false;
    }
  }
  validate12.errors = vErrors;
  return errors === 0;
}
