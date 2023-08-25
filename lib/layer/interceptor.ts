import { ResponseTransformer, rest } from "msw";
import { setupServer } from "msw/node";
import { GetItemCommand } from "dynamodb-toolbox";
import { lambdaHttpInterceptorConfigEntity } from "../sdk/lambdaHttpInterceptorConfigEntity";
import {
  getEnv,
  getRequestResponse,
  AWS_LAMBDA_FUNCTION_NAME,
  HTTP_INTERCEPTOR_TABLE_NAME,
  MockConfig,
} from "../sdk";

const fetchInterceptorConfig = async (): Promise<MockConfig[] | undefined> => {
  const command = new GetItemCommand(lambdaHttpInterceptorConfigEntity, {
    lambdaName: getEnv(AWS_LAMBDA_FUNCTION_NAME),
  });

  const { Item } = await command.send();

  return Item?.mockConfigs;
};

const server = setupServer(
  rest.all("*", async (req, res, ctx) => {
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

    console.log("request intercepted", request);

    const mockConfigs = await fetchInterceptorConfig();
    if (!mockConfigs) {
      return req.passthrough();
    }

    const response = getRequestResponse(request, mockConfigs);

    if (response.passThrough === true) {
      return req.passthrough();
    }

    const responseTransformers = [
      ctx.status(response.status),
      response.body && ctx.text(response.body),
      ...Object.entries(response.headers ?? {}).map(
        ([key, value]) => value && ctx.set(key, value),
      ),
    ].filter((transformer): transformer is ResponseTransformer =>
      Boolean(transformer),
    );

    return res(...responseTransformers);
  }),
);

server.listen({ onUnhandledRequest: "bypass" });
