import * as path from 'path';

import { syncTestEnvVars } from '@swarmion/integration-tests';

// @ts-ignore
await syncTestEnvVars({
  scope: 'http-interceptor-test',
  cacheFilePath: path.resolve(__dirname, './testEnvVarsCache.json'),
});
