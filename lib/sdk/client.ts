import {
  LambdaHttpInterceptorConfigInput,
  cleanInterceptedCalls,
  putLambdaHttpInterceptorConfig,
  pollInterceptedCalls,
  PollInterceptedCallsParams,
} from './tables';
import { InterceptedCallParams } from './types';

export class HttpLambdaInterceptorClient {
  public lambdaName: string;

  constructor(lambdaName: string) {
    this.lambdaName = lambdaName;
  }

  /**
   * Creates the ddb records in the ddb table used to intercept http calls.
   *
   * @param configs - the configs to use for mocking http calls
   *
   * It creates the config if it doesn't exists. It updates the config if it already exists.
   */
  async createConfigs(
    configs: LambdaHttpInterceptorConfigInput['mockConfigs'],
  ): Promise<void> {
    const params = {
      lambdaName: this.lambdaName,
      mockConfigs: configs,
    };
    await putLambdaHttpInterceptorConfig(params);
  }

  /**
   * Clean all InterceptedCall made with this lambda name.
   *
   * This is especially recommended to use between each execution of the lambda that is being tested in order not to have collisions between different tests.
   */
  async cleanInterceptedCalls(): Promise<void> {
    return cleanInterceptedCalls(this.lambdaName);
  }

  /**
   * Poll and returns all intercepted calls of this lambda.
   *
   * @param numberOfCallsToExpect number
   * @param timeout number in milliseconds - default value to 10000ms
   * @returns InterceptedCallParams
   *
   * Returns intercepted calls of this lambda. Assertions can be made on the results of this method that returns what has been intercepted based on the config created in the first place.
   * If the numberOfCallsToExpect is strictly greater than the number of configured calls intercepted, this method will timeout.
   */
  async pollInterceptedCalls(
    params: PollInterceptedCallsParams,
  ): Promise<InterceptedCallParams[]> {
    return pollInterceptedCalls(this.lambdaName, params);
  }
}
