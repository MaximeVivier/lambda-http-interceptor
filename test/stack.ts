import { Stack, StackProps } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

import { Construct } from "constructs";
import {
  HttpInterceptorExtension,
  applyNodejsInternalExtension,
} from "../dist"; // We need to use build package here to have the correct link to layer code -> The code must be built between two tests
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { getCdkHandlerPath } from "@swarmion/serverless-helpers";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { TestEnvVar } from "@swarmion/integration-tests";

export class LambdaHttpInterceptorTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const httpApi = new HttpApi(this, "HttpApi");

    new TestEnvVar(this, "API_URL", {
      value: httpApi.url as string,
    });

    const makeExternalCallFunction = new NodejsFunction(
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
    applyNodejsInternalExtension(
      makeExternalCallFunction,
      new HttpInterceptorExtension(this, "InterceptorExtension"),
    );

    const makeExternalCallIntegration = new HttpLambdaIntegration(
      "MakeExternalCallsIntegration",
      makeExternalCallFunction,
    );

    httpApi.addRoutes({
      path: "/make-external-call",
      methods: [HttpMethod.POST],
      integration: makeExternalCallIntegration,
    });
  }
}
