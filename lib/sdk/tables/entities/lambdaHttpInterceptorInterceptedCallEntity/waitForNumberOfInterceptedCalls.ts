import { InterceptedCallParams } from 'sdk';
import {
  fetchInterceptedCalls,
  listInterceptedCallsPkAndSk,
} from './fetchInterceptedCalls';

const sleep = (delayInMs: number) =>
  new Promise(resolve => setTimeout(resolve, delayInMs));

const DEFAULT_TIMEOUT = 10000;

export type PollInterceptedCallsParams = {
  numberOfCallsToExpect: number;
  timeout?: number;
};

/**
 * Wait for intercepted calls to be available
 *
 * @param lambdaName string
 * @param numberOfCallsToExpect number
 * @param timeout number in milliseconds - default value to 10000ms
 */
export const pollInterceptedCalls = async (
  lambdaName: string,
  { numberOfCallsToExpect, timeout }: PollInterceptedCallsParams,
): Promise<InterceptedCallParams[]> => {
  const startTime = Date.now();
  let currentInterceptedCallsCount: number = 0;
  do {
    const interceptedCallsPkAndSk = await listInterceptedCallsPkAndSk(
      lambdaName,
    );
    currentInterceptedCallsCount = interceptedCallsPkAndSk.length;
    if (currentInterceptedCallsCount >= numberOfCallsToExpect) {
      return fetchInterceptedCalls(lambdaName);
    }
    sleep(200);
  } while (Date.now() - startTime <= (timeout ?? DEFAULT_TIMEOUT));
  throw new Error(
    `[waitForNumberOfInterceptedCalls ERROR] Waited for ${timeout}ms for ${numberOfCallsToExpect} intercepted calls but only got ${currentInterceptedCallsCount}`,
  );
};
