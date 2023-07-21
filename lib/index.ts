// import * as cdk from 'aws-cdk-lib';
import { getCdkHandlerPath } from "@swarmion/serverless-helpers";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { existsSync } from "fs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface LambdaHttpInterceptorProps {
  // Define construct properties here
}

export class LambdaHttpInterceptor extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: LambdaHttpInterceptorProps = {},
  ) {
    super(scope, id);

    const tsFileHandler = getCdkHandlerPath(__dirname, { extension: "ts" });
    const jsFileHandler = getCdkHandlerPath(__dirname, { extension: "js" });
    const entryFile = existsSync(tsFileHandler) ? tsFileHandler : jsFileHandler;
    const lambda = new NodejsFunction(this, "Lambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "index.handler",
      entry: entryFile,
    });
  }
}
