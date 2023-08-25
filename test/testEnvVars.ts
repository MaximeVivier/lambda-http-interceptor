// This file is automatically generated. Do not edit it manually. cf https://www.swarmion.dev/docs/how-to-guides/use-integration-tests
import { getTestEnvVars } from "@swarmion/integration-tests";

export type TestEnvVarsType = {
  API_URL: string;
  HTTP_INTERCEPTOR_TABLE_NAME: string;
  MAKE_EXTERNAL_CALLS_FUNCTION_NAME: string;
};

export const TEST_ENV_VARS = getTestEnvVars<TestEnvVarsType>();
