import { LambdaHttpInterceptorConfig } from './lambdaHttpInterceptorConfigEntity';
import { InterceptedCall } from './lambdaHttpInterceptorInterceptedCallEntity';

export type MockConfig = LambdaHttpInterceptorConfig['mockConfigs'][number];
export type InterceptedCallParams = InterceptedCall['callParams'];

export type Request = {
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
};
