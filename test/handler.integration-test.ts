import fetch from 'node-fetch';
import { expect, describe, it, beforeAll, afterEach, afterAll } from 'vitest';

import { TEST_ENV_VARS } from './testEnvVars';
import {
  cleanInterceptedCalls,
  setupLambdaHttpInterceptorConfig,
  waitForNumberOfInterceptedCalls,
} from '../lib/sdk';

describe('hello function', () => {
  beforeAll(async () => {
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
  });
  afterEach(async () => {
    await cleanInterceptedCalls(
      TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
    );
  });
  it('returns 200 and catches 2 requests', async () => {
    const response = await fetch(
      `${TEST_ENV_VARS.API_URL}/make-external-call`,
      {
        method: 'post',
      },
    );

    const resp = await waitForNumberOfInterceptedCalls(
      TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
      2,
      5000,
    );
    expect(response.status).toBe(200);
    expect(resp.length).toBe(2);
  });
  it('returns also 200 and catches also 2 requests', async () => {
    const response = await fetch(
      `${TEST_ENV_VARS.API_URL}/make-external-call`,
      {
        method: 'post',
      },
    );

    const resp = await waitForNumberOfInterceptedCalls(
      TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
      2,
      5000,
    );

    expect(response.status).toBe(200);
    expect(resp.length).toBe(2);
  });
});
