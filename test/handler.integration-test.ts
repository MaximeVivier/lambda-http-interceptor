import fetch from 'node-fetch';
import { expect, describe, it, beforeAll, afterEach, afterAll } from 'vitest';

import { TEST_ENV_VARS } from './testEnvVars';
import { HttpLambdaInterceptorClient } from '../lib/sdk';

describe('hello function', () => {
  const interceptorClient = new HttpLambdaInterceptorClient(
    TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
  );
  beforeAll(async () => {
    await interceptorClient.createConfigs([
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
    ]);
  });
  afterEach(async () => {
    await interceptorClient.cleanInterceptedCalls();
  });
  it('returns 200 and catches 2 requests', async () => {
    const response = await fetch(
      `${TEST_ENV_VARS.API_URL}/make-external-call`,
      {
        method: 'post',
      },
    );

    const resp = await interceptorClient.pollInterceptedCalls({
      numberOfCallsToExpect: 2,
      timeout: 5000,
    });
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

    const resp = await interceptorClient.pollInterceptedCalls({
      numberOfCallsToExpect: 2,
      timeout: 5000,
    });

    expect(response.status).toBe(200);
    expect(resp.length).toBe(2);
  });
});
