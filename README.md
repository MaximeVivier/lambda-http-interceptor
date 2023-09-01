# HTTP Lambda Interceptor

This library enables you to run integration tests on deployed lambda without worrying about calling external services by mocking them even though lambda are already deployed.

Performing integration tests on deployed resources allows you to test your application in the best prod alike environment. Thanks to the interceptor, you can test your lambda without interacting with costly external endpoints or non preprod external endpoints for example.

## How does the interceptor works

This library is made of a CDK Construct to instantiate in your stack and a sdk to tool the integration tests.

### A CDK Construct

The HttpInterceptor needs to be instantiated inside a stack. It contains what is necessary to mock calls.

Then a method needs to be used to link any Lambda to the extension that has been set.

```typescript
import { Stack, StackProps } from "aws-cdk-lib";

import { Construct } from "constructs";
import { HttpInterceptor, applyHttpInterceptor } from "http-lambda-interceptor";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { getCdkHandlerPath } from "@swarmion/serverless-helpers";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { TestEnvVar } from "@swarmion/integration-tests";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const interceptor = new HttpInterceptor(this, "HttpInterceptor");

    new TestEnvVar(this, "HTTP_INTERCEPTOR_TABLE_NAME", {
      value: interceptor.table.tableName,
    });

    const makeExternalCallsFunction = new NodejsFunction(
      this,
      "MakeExternalCalls",
      {
        runtime: Runtime.NODEJS_18_X,
        handler: "index.handler",
        entry: getCdkHandlerPath(__dirname),
        environment: {
          NODE_OPTIONS: "--enable-source-maps",
        },
      },
    );

    applyHttpInterceptor(makeExternalCallsFunction, interceptor);
  }
}
```

The construct exposes the name of the DynamoDB table that is used to perform under the hood the configuration of all mocks.
This variable needs to be instantiated to the test environment in which the integration tests are performed.

This library recommend using the TestEnvVar construct developed by the @swarmion team. But this can be done by the way you want.
You can also specify the name of this table yourself in the configuration of the HttpInterceptor construct.

The other part of the library sits in the sdk used to perform the mocking part. because with only this part, lambda work the same way they did before attaching the extension to it

### The SDK to use in integration tests

The SDK part is the tooling used to configure the calls that need to be intercepted.

The extension also uses the SDK for fetching the configuration that are set in the tests.

#### It is really easy to setup the calls configuration

A method named `setupLambdaHttpInterceptorConfig` is used to set up the configuration that will be used by the lambda to handle the interception of the calls.

The only requirement for the lambda calls to be intercepted is that this setup needs to be done synchronously before the call of the lambda.You can trigger the lambda synchronously or asynchronously (with an event EventBridge for example), but the setup of the config needs to be done before that.

This is the type of object you need to pass as argument to create the configuration

```typescript
type LambdaHttpInterceptorConfigInput = {
  lambdaName: string;
  mockConfigs: {
    url?: string;
    method?: string;
    body?: string;
    headers?: {
      [x: string]: string;
    };
    response:
      | {
          passThrough: true;
        }
      | {
          status: number;
          body?: string;
          headers?: {
            [x: string]: string;
          };
          passThrough?: false;
        };
    created?: string;
    modified?: string;
    queryParams?:
      | {
          [x: string]: string | undefined;
        }
      | undefined;
  }[];
};
```

This is how to use the `setupLambdaHttpInterceptorConfig` method.

```typescript
import fetch from "node-fetch";
import { expect, describe, it } from "vitest";

import { TEST_ENV_VARS } from "./testEnvVars";
import { setupLambdaHttpInterceptorConfig } from "../lib/sdk";

describe("hello function", () => {
  it("returns a 200", async () => {
    await setupLambdaHttpInterceptorConfig({
      lambdaName: TEST_ENV_VARS.MAKE_EXTERNAL_CALLS_FUNCTION_NAME,
      mockConfigs: [
        {
          url: "https://external-api.com/*",
          response: {
            status: 404,
            body: JSON.stringify({
              errorMessage: "Not found",
            }),
          },
        },
      ],
    });
    const response = await fetch(
      `${TEST_ENV_VARS.API_URL}/make-external-call`,
      {
        method: "post",
      },
    );
    expect(response.status).toBe(200);
  });
});
```
