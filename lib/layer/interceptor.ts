import { ResponseTransformer, rest } from 'msw';
import { setupServer } from 'msw/node';
import { GetItemCommand } from 'dynamodb-toolbox';
import debug from 'debug';
import { lambdaHttpInterceptorConfigEntity } from '../sdk/lambdaHttpInterceptorConfigEntity';
import {
  getEnv,
  getRequestResponse,
  AWS_LAMBDA_FUNCTION_NAME,
  HTTP_INTERCEPTOR_TABLE_NAME,
  MockConfig,
  putInterceptedCall,
} from '../sdk';

const log = debug('http-interceptor');

const fetchInterceptorConfig = async (): Promise<MockConfig[] | undefined> => {
  const command = new GetItemCommand(lambdaHttpInterceptorConfigEntity, {
    lambdaName: getEnv(AWS_LAMBDA_FUNCTION_NAME),
  });

  const { Item } = await command.send();

  return Item?.mockConfigs;
};

const server = setupServer(
  rest.all('*', async (req, res, ctx) => {
    try {
    const request = {
      url: req.url.toString(),
      method: req.method,
      headers: req.headers.all(),
      body: await req.text(),
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

    const mockConfigs = await fetchInterceptorConfig();
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
