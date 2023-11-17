import { LambdaHttpInterceptorConfig } from './tables/entities/lambdaHttpInterceptorConfigEntity/entity';
import { InterceptedCall } from './tables/entities/lambdaHttpInterceptorInterceptedCallEntity/entity';

export type MockConfig = LambdaHttpInterceptorConfig['mockConfigs'][number];
export type InterceptedCallParams = InterceptedCall['callParams'];

export type Request = {
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
};
