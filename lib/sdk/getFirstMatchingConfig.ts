import { MockConfig, Request } from './types';
import { requestMatchConfig } from './requestMatchConfig';

export const getFirstMatchingConfig = (
  request: Request,
  configs: MockConfig[],
): MockConfig | undefined =>
  configs.find(config => {
    return requestMatchConfig(request, config);
  });

export const getRequestResponse = (
  request: Request,
  configs: MockConfig[],
): MockConfig['response'] =>
  getFirstMatchingConfig(request, configs)?.response ?? { passThrough: true };
