export const HTTP_INTERCEPTOR_TABLE_NAME = 'HTTP_INTERCEPTOR_TABLE_NAME';
export const AWS_LAMBDA_FUNCTION_NAME = 'AWS_LAMBDA_FUNCTION_NAME'; // AWS Lambda automatically sets this variable

export type EnvVariableName =
  | typeof HTTP_INTERCEPTOR_TABLE_NAME
  | typeof AWS_LAMBDA_FUNCTION_NAME;

export const getEnv = (key: EnvVariableName): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
};
