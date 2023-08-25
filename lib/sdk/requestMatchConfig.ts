import { MockConfig, Request } from "./types";

const urlMatch = (
  requestUrl: string,
  configUrl: string | undefined,
): boolean => {
  if (!configUrl) {
    return true;
  }
  if (configUrl === requestUrl) {
    return true;
  }
  if (
    configUrl.endsWith("*") &&
    requestUrl.startsWith(configUrl.slice(0, -1))
  ) {
    return true;
  }
  return false;
};

const methodMatch = (
  requestMethod: string,
  configMethod: string | undefined,
): boolean => configMethod === undefined || configMethod === requestMethod;

const bodyMatch = (
  requestBody: string,
  configBody: string | undefined,
): boolean => configBody === undefined || configBody === requestBody;

const sanitizeHeaders = (
  headers: Record<string, string>,
): Record<string, string> =>
  Object.entries(headers).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value;
      return acc;
    },
    {},
  );
const headersMatch = (
  requestHeaders: Record<string, string>,
  configHeaders: Record<string, string | undefined> | undefined,
): boolean => {
  if (configHeaders === undefined) {
    return true;
  }
  const sanitizedRequestHeaders = sanitizeHeaders(requestHeaders);
  for (const [key, value] of Object.entries(configHeaders)) {
    if (sanitizedRequestHeaders[key.toLowerCase()] !== value) {
      return false;
    }
  }
  return true;
};
export const requestMatchConfig = (
  request: Request,
  config: MockConfig,
): boolean =>
  urlMatch(request.url, config.url) &&
  methodMatch(request.method, config.method) &&
  bodyMatch(request.body, config.body) &&
  headersMatch(request.headers, config.headers);
