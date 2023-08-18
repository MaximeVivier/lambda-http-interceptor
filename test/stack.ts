import { Stack, StackProps } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

import { Construct } from "constructs";
import { HttpInterceptor, applyNodejsInternalExtension } from "../dist"; // We need to use build package here to have the correct link to layer code -> The code must be built between two tests
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { getCdkHandlerPath } from "@swarmion/serverless-helpers";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { TestEnvVar } from "@swarmion/integration-tests";
import { HTTP_INTERCEPTOR_TABLE_NAME } from "../lib/sdk";

export class LambdaHttpInterceptorTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const httpApi = new HttpApi(this, "HttpApi");

    new TestEnvVar(this, "API_URL", {
      value: httpApi.url as string,
    });

    const interceptor = new HttpInterceptor(this, "HttpInterceptor");

    new TestEnvVar(this, "HTTP_INTERCEPTOR_TABLE_NAME", {
      value: interceptor.table.tableName,
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
          [HTTP_INTERCEPTOR_TABLE_NAME]: interceptor.table.tableName,
        },
      },
    );
    applyNodejsInternalExtension(
      makeExternalCallFunction,
      interceptor.extension,
    );
    interceptor.table.grantReadData(makeExternalCallFunction);

    new TestEnvVar(this, "MAKE_EXTERNAL_CALLS_FUNCTION_NAME", {
      value: makeExternalCallFunction.functionName,
    });

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
