import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  HttpInterceptorExtension,
  applyNodejsInternalExtension,
} from "../dist"; // We need to use build package here to have the correct link to layer code -> The code must be built between two tests
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { getCdkHandlerPath } from "@swarmion/serverless-helpers";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class LambdaHttpInterceptorTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambda = new NodejsFunction(this, "Lambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "index.handler",
      entry: getCdkHandlerPath(__dirname),
      environment: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    });
    applyNodejsInternalExtension(
      lambda,
      new HttpInterceptorExtension(this, "InterceptorExtension"),
    );
  }
}
