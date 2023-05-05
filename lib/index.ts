// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface LambdaHttpInterceptorProps {
  // Define construct properties here
}

export class LambdaHttpInterceptor extends Construct {

  constructor(scope: Construct, id: string, props: LambdaHttpInterceptorProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'LambdaHttpInterceptorQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
