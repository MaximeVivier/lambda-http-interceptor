import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { NodejsInternalExtension } from "./applyNodejsInternalExtension";
import {
  Architecture,
  Code,
  LayerVersion,
  Runtime,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import {
  LAMBDA_HTTP_INTERCEPTOR_TABLE_NAME,
  PARTITION_KEY,
  SORT_KEY,
} from "./constants";

export class HttpInterceptorExtension
  extends Construct
  implements NodejsInternalExtension
{
  public readonly layerVersion: LayerVersion;
  public readonly entryPoint: string;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.layerVersion = new LayerVersion(scope, "HttpInterceptorLayer", {
      compatibleRuntimes: [Runtime.NODEJS_18_X],
      compatibleArchitectures: [Architecture.ARM_64],
      code: Code.fromAsset(`${__dirname}/layer`),
    });
    this.entryPoint = "interceptor.js";

    new Table(this, LAMBDA_HTTP_INTERCEPTOR_TABLE_NAME, {
      partitionKey: { name: PARTITION_KEY, type: AttributeType.STRING },
      sortKey: { name: SORT_KEY, type: AttributeType.NUMBER },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: LAMBDA_HTTP_INTERCEPTOR_TABLE_NAME,
    });
  }
}
