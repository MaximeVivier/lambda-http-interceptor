import {
  fetchInterceptedCalls,
  listInterceptedCallsPkAndSk,
} from './fetchInterceptedCalls';

const sleep = (delayInMs: number) =>
  new Promise(resolve => setTimeout(resolve, delayInMs));

/**
 * Wait for intercepted calls to be available
 *
 * @param lambdaName string
 * @param numberOfCallsToExpect number
 * @param timeout number in milliseconds
 */
export const waitForNumberOfInterceptedCalls = async (
  lambdaName: string,
  numberOfCallsToExpect: number,
  timeout: number,
) => {
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
  } while (Date.now() - startTime <= timeout);
  throw new Error(
    `[waitForNumberOfInterceptedCalls ERROR] Waited for ${timeout}ms for ${numberOfCallsToExpect} intercepted calls but only got ${currentInterceptedCallsCount}`,
  );
};
