import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { LambdaHttpInterceptor } from "../lib";

export class LambdaHttpInterceptorTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new LambdaHttpInterceptor(this, "LambdaHttpInterceptor");
  }
}
