import fetch from 'node-fetch';
import {
  EventBridgeClient,
  PutEventsCommand,
} from '@aws-sdk/client-eventbridge';
import { expect, describe, it, beforeAll, afterEach, afterAll } from 'vitest';

import { TEST_ENV_VARS } from './testEnvVars';
import { HttpLambdaInterceptorClient } from '../lib/sdk';
import { testEventPattern } from './testEvent';

const eventbridgeClient = new EventBridgeClient({ region: 'eu-west-1' });

describe('Multiple asynchrous calls in band', () => {
  const interceptorClient = new HttpLambdaInterceptorClient(
    TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
  );
  const eventToTriggerTestLambdaPutCommand = new PutEventsCommand({
    Entries: [
      {
        Detail: JSON.stringify({}),
        DetailType: testEventPattern.detailType[0],
        EventBusName: TEST_ENV_VARS.TEST_STACK_EVENT_BUS_NAME,
        Source: testEventPattern.source[0],
      },
    ],
  });
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
    await eventbridgeClient.send(eventToTriggerTestLambdaPutCommand);

    const resp = await interceptorClient.pollInterceptedCalls({
      numberOfCallsToExpect: 2,
      timeout: 5000,
    });
    expect(resp.length).toBe(2);
  });
  it('returns also 200 and catches also 2 requests', async () => {
    await eventbridgeClient.send(eventToTriggerTestLambdaPutCommand);

    const resp = await interceptorClient.pollInterceptedCalls({
      numberOfCallsToExpect: 2,
      timeout: 5000,
    });

    expect(resp.length).toBe(2);
  });
});
