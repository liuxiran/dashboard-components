import setValue from 'set-value';
import BreadcrumbSeparator from 'antd/lib/breadcrumb/BreadcrumbSeparator';

type TransformerType = 'schema' | 'request' | 'response';

const schemaRewriteHeader = (data: any) => {
  const { description } = data?.properties?.headers;

  setValue(data, 'properties.headers', {
    description,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
        },
        value: {
          "type": "object",
          "oneOf": [
            {
              "title": "value type is string",
              "properties": {
                "value": {
                  "type": "string"
                }
              }
            },
            {
              "title": "value type is number",
              "properties": {
                "value": {
                  "type": "number"
                }
              }
            }
          ]
        },
      },
    },
  });
  return data;
};

/**
 * Transform data before sending Request
 */
const requestRewriteHeader = (data: any) => {
  const headers = {};
  (data.headers || []).forEach((item: Record<string, string>) => {
    headers[item.key] = item.value;
  });
  setValue(data, 'headers', headers);
  return data;
};

/**
 * Transform data after receiving Response
 */
const responseRewriteHeader = (data: any) => {
  const headers = Object.entries(data?.headers || {}).map(([key, value]) => {
    return {
      key,
      value,
    };
  });
  setValue(data, 'headers', headers);
  return data;
};


const schemaRequestValidation = (data: any) => {
  const requestValidateSchema = 
  {
    "type": "object",
    "properties": {
      "requestParams": {
        "title": "define request paramers",
        "type": "array",
        "items": {
          "type": "object",
          "anyOf": [
            {
              "title": "define body params",
              "properties": {
                "body_schema": {
                  "$ref": "#/definitions/requestParams"
                }
              },
              "required": ["body_schema"],
              "minItems": 1
            },
            {
              "title": "define header params",
              "properties": {
                "header_schema": {
                  "$ref": "#/definitions/requestParams"
                }
              },
              "required": ["header_schema"],
              "minItems": 1
            }
          ]
        },
        "minItems": 1
      }
    },
    "definitions": {
      "requestParams": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string"
          },
          "valueType": {
            "type": "string",
            "enum": [
              "string",
              "array",
              "integer",
              "number",
              "object",
              "boolean"
            ]
          },
          "required": {
            "type": "boolean"
          }
        },
        "dependencies": {
          "valueType": {
            "oneOf": [
              {
                "properties": {
                  "valueType": {
                    "enum": [
                      "string"
                    ]
                  },
                  "minLength": {
                    "type": "integer"
                  },
                  "maxLength": {
                    "type": "integer"
                  },
                  "pattern": {
                    "type": "string"
                  },
                  "enumValues": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                },
                "required": ["valueType"]
              },
              {
                "properties": {
                  "valueType": {
                    "enum": [
                      "array"
                    ]
                  },
                  "minItems": {
                    "type": "integer"
                  },
                  "itemsType": {
                    "type": "string",
                    "enum": [
                      "string",
                      "array",
                      "integer",
                      "number",
                      "object",
                      "boolean"
                    ]
                  },
                  "uniqueItems": {
                    "type": "boolean"
                  }
                },
                "required": [
                  "valueType"
                ]
              },
              {
                "properties": {
                  "valueType": {
                    "enum": [
                      "integer"
                    ]
                  },
                  "minimum": {
                    "type": "integer"
                  },
                  "maximum": {
                    "type": "integer"
                  }
                },
                "required": [
                  "valueType"
                ]
              },
              {
                "properties": {
                  "valueType": {
                    "enum": [
                      "number"
                    ]
                  },
                  "minimum": {
                    "type": "number"
                  },
                  "maximum": {
                    "type": "number"
                  }
                },
                "required": [
                  "valueType"
                ]
              },
              {
                "properties": {
                  "valueType": {
                    "enum": [
                      "object"
                    ]
                  }
                },
                "required": [
                  "valueType"
                ]
              },
              {
                "properties": {
                  "valueType": {
                    "enum": [
                      "boolean"
                    ]
                  }
                },
                "required": [
                  "valueType"
                ]
              }
            ]
          }
        }
      }
    }
  }
  return requestValidateSchema
};

/**
 * Transform data before sending Request
 */
const requestRequestValidation = (data: any) => {
  console.log('in requestRequestValidation')
  console.log(data)
  
  let requestData = {
    body_schema: {
      type: "object",
      required: [],
      properties: {},
    },
    header_schema: {
      type: "object",
      required: [],
      properties: {},
    }
  }
 
  data.requestParams.forEach((param: any) => {
    let schemaType = Object.keys(param)[0];
    Object.keys(param).forEach((schemaType) => {
      if (param[schemaType].toString() === {}) {
        return
      }
      requestData[schemaType].properties = {
        ...requestData[schemaType].properties,
        [param[schemaType].key]: {
          type: param[schemaType].valueType
        }
      }
  
      Object.keys(param[schemaType]).forEach((schemaKey: string) => {
        // enhancement validate parameters
        if (schemaKey !== "valueType" && schemaKey !== "required" && schemaKey !== "key") {
          requestData[schemaType].properties[param[schemaType].key] = {
            ...requestData[schemaType].properties[param[schemaType].key],
            [schemaKey]: param[schemaType][schemaKey]
          }
        }
  
        if (schemaKey === "required" && param[schemaType][schemaKey]){
          requestData[schemaType].required = [
            ...requestData[schemaType].required,
            param[schemaType].key
          ]
        }
      })
    })

    
  });

  console.log(requestData)
  console.log("----------------------------------------")
};

/**
 * Transform data after receiving Response
 */
const responseRequestValidation = (data: any) => {
  console.log("in responseRequestValidation")
  console.log(data)
  console.log("----------------------")
};

const schemaPrometheus = (data: object) => {
  return {
    ...data,
    properties: {
      enabled: {
        type: 'boolean',
      },
    },
  };
};

export const transformPlugin = (name: string, data: any, type: TransformerType) => {
  switch (name) {
    case 'response-rewrite':
    case 'proxy-rewrite':
      if (type === 'schema') {
        return schemaRewriteHeader(data);
      }
      if (type === 'request') {
        return requestRewriteHeader(data);
      }
      if (type === 'response') {
        return responseRewriteHeader(data);
      }
      break;
    case 'request-validation':
      console.log('case request_validation')
      console.log(type)
      console.log('----------')
      if (type === 'schema') {
        return schemaRequestValidation(data);
      }
      if (type === 'request') {
        return requestRequestValidation(data);
      }
      if (type === 'response') {
        return responseRequestValidation(data);
      }
      break;
    default:
      break;
  }
  return data;
};

export const transformPlugins = (data: Record<string, object> = {}, type: TransformerType) => {
  const plugins = {};
  Object.entries(data).forEach(([name, value]) => {
    if (transformPlugin(name, value, type)) {
      plugins[name] = transformPlugin(name, value, type);
    }
  });
  return plugins;
};
