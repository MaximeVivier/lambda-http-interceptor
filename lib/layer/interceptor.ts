import { ResponseTransformer, rest } from 'msw';
import { setupServer } from 'msw/node';
import debug from 'debug';
import {
  getEnv,
  getRequestResponse,
  AWS_LAMBDA_FUNCTION_NAME,
  HTTP_INTERCEPTOR_TABLE_NAME,
  putInterceptedCall,
  fetchLambdaHttpInterceptorConfig,
} from '../sdk';

const log = debug('http-interceptor');

const server = setupServer(
  rest.all('*', async (req, res, ctx) => {
    try {
      const queryParams: Record<string, string> = {};
      req.url.searchParams.forEach((value, key) => (queryParams[key] = value));
      const request = {
        url: req.url.toString(),
        method: req.method,
        headers: req.headers.all(),
        body: await req.text(),
        queryParams,
      };

      if (
        request.url.match(/dynamodb\..*\.amazonaws.com/) &&
        request.body.match(
          new RegExp(`"TableName":"${getEnv(HTTP_INTERCEPTOR_TABLE_NAME)}"`),
        )
      ) {
        return req.passthrough();
      }

      log('request intercepted: ', JSON.stringify(request, null, 2));

      const mockConfigs = await fetchLambdaHttpInterceptorConfig();
      if (mockConfigs === undefined) {
        return req.passthrough();
      }

      const mockResponse = getRequestResponse(request, mockConfigs);

      if (mockResponse.isOneOfConfiguredMocks) {
        await putInterceptedCall({
          lambdaName: getEnv(AWS_LAMBDA_FUNCTION_NAME),
          callParams: request,
        });
      }
      if (mockResponse.passThrough) {
        log(`letting ${request.method} ${request.url} pass through`);
        return req.passthrough();
      }

      const responseTransformers = [
        ctx.status(mockResponse.status),
        mockResponse.body && ctx.text(mockResponse.body),
        ...Object.entries(mockResponse.headers ?? {}).map(
          ([key, value]) => value && ctx.set(key, value),
        ),
      ].filter((transformer): transformer is ResponseTransformer =>
        Boolean(transformer),
      );

      log(
        `responding to ${request.method} ${request.url}`,
        JSON.stringify(mockResponse, null, 2),
      );

      return res(...responseTransformers);
    } catch (err) {
      console.error('Extension http interceptor ERROR:', err);
      return res();
    }
  }),
);

server.listen({ onUnhandledRequest: 'bypass' });
