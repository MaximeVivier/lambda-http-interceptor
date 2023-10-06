import fetch from 'node-fetch';
import { expect, describe, it, afterAll } from 'vitest';

import { TEST_ENV_VARS } from './testEnvVars';
import {
  cleanInterceptedCalls,
  fetchInterceptedCalls,
  setupLambdaHttpInterceptorConfig,
} from '../lib/sdk';

describe('hello function', () => {
  afterAll(async () => {
    console.log('Cleaning up');
    await cleanInterceptedCalls(
      TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
    );
    console.log('Cleaned up');
  });
  it('returns a 200', async () => {
    await setupLambdaHttpInterceptorConfig({
      lambdaName: TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
      mockConfigs: [
        {
          url: 'https://api.coindesk.com/*',
          response: {
            status: 404,
            body: JSON.stringify({
              errorMessage: 'Not found',
            }),
          },
        },
        {
          url: 'https://catfact.ninja/fact',
          response: {
            passThrough: true,
          },
        },
      ],
    });
    const response = await fetch(
      `${TEST_ENV_VARS.API_URL}/make-external-call`,
      {
        method: 'post',
      },
    );

    const resp = await fetchInterceptedCalls(
      TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
    );
    resp.forEach(callParams => {
      console.log(callParams);
    });
    expect(response.status).toBe(200);
  });
});
