import { LambdaHttpInterceptorConfig } from "./lambdaHttpInterceptorConfigEntity";

export type MockConfig = LambdaHttpInterceptorConfig["mockConfigs"][number];

export type Request = {
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
};
