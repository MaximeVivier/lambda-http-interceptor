# HTTP Lambda Interceptor

This library enables you intercept and mock HTTP call made by an AWS Lambda. It's useful for integration testing.

Performing integration tests on deployed resources allows testing applications in the best prod alike environment. Thanks to the interceptor, lambda can be tested without interacting with costly external endpoints or non preprod external endpoints for example.

## Getting started

This library is made of a CDK Construct to instantiate in your stack and a sdk to tool the integration tests.

The HttpInterceptor construct needs to be instantiated in the stack, or inside another Construct.

```ts
import { Stack, StackProps } from "aws-cdk-lib";

import { Construct } from "constructs";
import { HttpInterceptor, applyHttpInterceptor } from "lambda-http-interceptor";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const interceptor = new HttpInterceptor(this, "HttpInterceptor");

    const myLambdaFunctionThatMakesExternalCalls = new NodejsFunction(
      this,
      "MakeExternalCalls",
      {
        runtime: Runtime.NODEJS_18_X,
        handler: "index.handler",
        entry: './handler.ts',
      },
    );

    applyHttpInterceptor(myLambdaFunctionThatDoesExternalCalls, interceptor);
  }
}
```

After deploying that part, everything is setup on the stack to perform integration tests.

```typescript
import fetch from "node-fetch";
import { expect, describe, it } from "vitest";

process.env.HTTP_INTERCEPTOR_TABLE_NAME = '<table-name-from-construct>'

import { HttpLambdaInterceptorClient } from "lambda-http-interceptor";

import { triggerMyLambdaFunctionThatMakesExternalCalls } from './utils';

describe("my test", () => {
  const interceptorClient = new HttpLambdaInterceptorClient(
    '<myLambdaFunctionThatMakesExternalCalls-name>',
  );
  it("tests my lambda function", async () => {
    await interceptorClient.createConfigs([
        {
          url: "https://api-1/*",
          response: {
            status: 404,
            body: JSON.stringify({
              errorMessage: "Not found",
            }),
          },
        },
        {
          url: "https://api-2/path",
          response: {
            passThrough: true,
          },
        },
      ]);
    await triggerMyLambdaFunctionThatMakesExternalCalls();
    const interceptedCalls = await interceptorClient.pollInterceptedCalls({
      numberOfCallsToExpect: 2,
      timeout: 5000,
    });
    expect(resp.interceptedCalls).toBe(2);
  });
});
```

>To resolve `<table-name-from-construct>` and `<myLambdaFunctionThatMakesExternalCalls-name>` easily, we recommend the usage of [@swarmion/integration-tests](https://www.swarmion.dev/docs/how-to-guides/use-integration-tests/)

## How it works

### The CDK Construct

The `HttpInterceptor` construct needs to be instantiated inside a stack. It contains what is necessary to mock calls:
- a DynamoDB table to store and fetch all calls to intercept and what to respond
- an extension to intercept these calls
- an aspect that applies this extension to every NodeJSFunction included in the stack

Then the method `applyHttpInterceptor` needs to be used to link any Lambda to the extension that has been set.
This method can be called with any construct and it will attach the extension to every NodejsFunction Construct nested inside it. Therefore, it can also be called with `this` in the constructor of the stack like the following.

```ts
import { Stack, StackProps } from "aws-cdk-lib";

import { Construct } from "constructs";
import { HttpInterceptor, applyHttpInterceptor } from "lambda-http-interceptor";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const interceptor = new HttpInterceptor(this, "HttpInterceptor");

    const myLambdaFunctionThatMakesExternalCalls = new NodejsFunction(
      this,
      "MakeExternalCalls",
      {
        runtime: Runtime.NODEJS_18_X,
        handler: "index.handler",
        entry: './handler.ts',
      },
    );

    applyHttpInterceptor(this, interceptor);
  }
}
```

The construct exposes the name of the DynamoDB table that is used to perform under the hood the configuration of all mocks.
This variable needs to be instantiated to the test environment in which the integration tests are performed.

You can also specify the name of this table yourself in the configuration of the HttpInterceptor construct.

The other part of the library sits in the sdk used to perform the mocking part. Because with only this part, lambda work the same way they did before attaching the extension to it.

### The SDK to use in integration tests

The SDK part is the tooling used to configure the calls that need to be intercepted. It is encapsulated inside a class named HttpLambdaInterceptorClient.

The extension also uses the SDK for fetching the configuration that are set in the tests.

#### How to setup the calls configuration

The method named `createConfigs` of the client is used to set up the configuration that will be used by the lambda to handle the interception of the calls. When you call it, it creates the config if it doesn't exist yet, and it updates it if a record already exists. Thus it can be called once in a tets suite to setup the config for all tests in a before all. And it can also be called at the beginning of every test to have a specific config per tets.

The only requirement for the lambda calls to be intercepted is that this setup needs to be done synchronously before the call of the lambda. You can trigger the lambda synchronously or asynchronously, but the setup of the config needs to be done before that.

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

This is how to use the `createConfigs` method.

```typescript
import fetch from "node-fetch";
import { expect, describe, it } from "vitest";

process.env.HTTP_INTERCEPTOR_TABLE_NAME = '<table-name-from-construct>'

import { setupLambdaHttpInterceptorConfig } from "lambda-http-interceptor";

import { triggerMyLambdaFunctionThatMakesExternalCalls } from './utils';

describe("my test", () => {
  it("tests my lambda function", async () => {
    await interceptorClient.createConfigs([
        {
          url: "https://api-1/*",
          response: {
            status: 404,
            body: JSON.stringify({
              errorMessage: "Not found",
            }),
          },
        },
        {
          url: "https://api-2/path",
          response: {
            passThrough: true,
          },
        },
      ]);
    await triggerMyLambdaFunctionThatMakesExternalCalls();
    const interceptedCalls = await interceptorClient.pollInterceptedCalls({
      numberOfCallsToExpect: 2,
      timeout: 5000,
    });
    expect(resp.interceptedCalls).toBe(2);
  });
});
```

The url matching process works by 2 possible ways:
- an exact match of the whole url (ex: `https://api-2/path-1/path-2`)
- an exact match on part of the url. Every url beginning with the same path until the `*`, is matched (ex: `https://api-1/path/*` matches `https://api-1/path` and `https://api-1/path/path-3`)

The method to be given in the method prop needs to be one the [standard HTTP request methods name](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods).

The response status to be given in the params needs to be one the [standard HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).


### Multiple lambda triggers into a testing suite or across testing suites

A `beforeEach` for setup and a `afterEach` with the cleaning method are required in order to make assertions independently between each test of a suite.

For avoiding collisions between testing suites, if the cleaning method is not called in a test for a specific reason, the method needs to be called in a `afterAll`.

And all tests dealing with the same lambda need to be performed sequentially, they can't be performed in parallel.

An example of the code described here is available in the following section.

### Making expects on the intercepted calls

The method `pollInterceptedCalls` is used to wait for all intercepted calls when they have been done. It needs configuration about the maximum time to wait before throwing because all supposed intercepted calls have been intercepted.

The response contains all information about the calls made to to external API endpoints mocked. Thus assertions can be made on the content of the calls made once received.

```typescript
import fetch from "node-fetch";
import { expect, describe, it } from "vitest";

process.env.HTTP_INTERCEPTOR_TABLE_NAME = '<table-name-from-construct>'

import { setupLambdaHttpInterceptorConfig } from "lambda-http-interceptor";

import { triggerMyLambdaFunctionThatMakesExternalCalls } from './utils';

describe("my test", () => {
  const interceptorClient = new HttpLambdaInterceptorClient(
    '<myLambdaFunctionThatMakesExternalCalls-name>',
  );
  beforeAll(async () => {
    await interceptorClient.createConfigs([
      {
        url: "https://api-1/*",
        response: {
          status: 404,
          body: JSON.stringify({
            errorMessage: "Not found",
          }),
        },
      },
      {
        url: "https://api-2/path",
        response: {
          passThrough: true,
        },
      },
    ]),
  });
  afterEach(async () => {
    await interceptorClient.cleanInterceptedCalls();
  });
  it('catches 2 requests', async () => {
    await triggerMyLambdaFunctionThatMakesExternalCalls();

    const interceptedCalls = await interceptorClient.pollInterceptedCalls({
      numberOfCallsToExpect: 2,
      timeout: 5000,
    });
    expect(resp.interceptedCalls).toBe(2);
  });
  it('catches also 2 requests', async () => {
    await triggerMyLambdaFunctionThatMakesExternalCalls();

    const interceptedCalls = await interceptorClient.pollInterceptedCalls({
      numberOfCallsToExpect: 2,
      timeout: 5000,
    });
    expect(resp.interceptedCalls).toBe(2);
  });
});
```
