import setValue from 'set-value';

type TransformerType = 'schema' | 'request' | 'response';

const schemaResponseRewrite = (data: any) => {
  const { description } = data?.properties?.headers;

  setValue(data, 'properties.headers', {
    description,
    type: 'array',
    minItems: 1,
    items: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
        },
        value: {
          type: 'string',
        },
      },
    },
  });

  return data;
};

/**
 * Transform data after receiving Response
 */
const responseResponseRewrite = (data: any) => {
  const headers = Object.entries(data?.properties?.headers || {}).map(([key, value]) => {
    return {
      key,
      value,
    };
  });
  setValue(data, 'headers', headers);
  return data;
};

/**
 * Transform data before sending Request
 */
const requestResponseRewrite = (data: any) => {
  const headers = {};
  (data.headers || []).forEach((item: Record<string, string>) => {
    headers[item.key] = item.value;
  });
  setValue(data, 'headers', headers);
  return data;
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
      if (type === 'schema') {
        return schemaResponseRewrite(data);
      }
      if (type === 'request') {
        return requestResponseRewrite(data);
      }
      if (type === 'response') {
        return responseResponseRewrite(data);
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
