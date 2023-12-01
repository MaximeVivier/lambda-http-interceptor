---
published: false
title: 'PLACEholder'
cover_image: 
description: ''
tags: 
series:
canonical_url:
---

## TL;DR

Learn how to perform integration tests iso prod with aws serverless services. Using lambda-http-interceptor you can easily intercept and mock http calls coming from your deployed lambda functions.

**Why should you use:**
- You want to test your lambda functions in a iso-prod environment
- You want to save money while running integration tests by not triggering costly third party APIs
- You want to control the behavior of third party APIs to test edge cases
- You don't want to change your lambda code to make it testable

And maybe you can use it for all theses reasons at the same time!

{% cta https://github.com/MaximeVivier/lambda-http-interceptor %} Try lambda-http-interceptor here 😉 {% endcta %}

##  Intercept http calls in lambda functions

The lib is made of a CDK Construct to instantiate in your stack.

The `HttpInterceptor` **construct needs to be instantiated in the stack**, or inside another Construct. And then **the interceptor needs to be applied to the lambda function** http calls need to be intercepted from.

The `applyHttpInterceptor` uses `Aspects` in order to apply it on each `NodeLambdaFunction` it finds, thus `applyHttpInterceptor` takes any Construct as input.

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

After deploying, everything is setup on the stack to then perform integration tests.

The second part of the lib is a set of **tools to perform integration tests**. They are gathered in the `HttpLambdaInterceptorClient` class.

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

## How does it work?

### lambda-http-interceptor stores the configurations and the call made in DynamoDB table

The `HttpInterceptor` instantiates a DynamoDB table in the stack. The table is used to store the configurations of the http calls to intercept. When performing integration tests, filling up the table with configuration is done using the `createConfigs` method of the `HttpLambdaInterceptorClient` class.

Then assertions can be made on the calls made by the lambda after they are fetched using the `pollInterceptedCalls` method of the `HttpLambdaInterceptorClient` class.

> Don't forget to give the user you're using to perform the integration tests the right to read in the table. In general, we use AdministratorAccess role for the user performing these tasks.

### lambda-http-interceptor uses an internal extension to intercept http calls in lambda functions

The internal extension that the interceptor deploys on the lambda functions overrides the `http` module of nodejs that is used to make http calls.

For each call made by the lambda, it fetches the http calls configuration stored in DynamoDB and either passes through the call or returns the response value configured at the start.

It keeps track of the http calls listed that are listed in the configuration. If the response of a call doesn't need to be changed but it still needs to be tracked in order to make assertions on it, the configuration of the call doesn't change and the response only contains `passthrough: true`.

If you want to deep dive the functioning of the interceptor, you can check out [this article](https://dev.to/slsbytheodo/power-up-your-serverless-application-with-aws-lambda-extensions-3a31) that presents extensions really clearly using a simple example.

## lambda-http-interceptor has everything built in

The setup is fairly easy and it can be used to make assertions on the calls made by your deployed lambda functions. The documentation is far more exhaustive to get you started.

{% cta https://github.com/MaximeVivier/lambda-http-interceptor %} Try lambda-http-interceptor here 😉 {% endcta %}

Don't hesitate to star it ⭐️
