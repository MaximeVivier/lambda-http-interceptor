import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import {
  LAMBDA_HTTP_INTERCEPTOR_TABLE_NAME,
  PARTITION_KEY,
  SORT_KEY,
} from "./constants";
import { HttpInterceptorExtension } from "./HttpInterceptorExtension";

export class HttpInterceptor extends Construct {
  public readonly extension: HttpInterceptorExtension;
  public readonly table: Table;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.extension = new HttpInterceptorExtension(this, `${id}Extension`);

    this.table = new Table(this, LAMBDA_HTTP_INTERCEPTOR_TABLE_NAME, {
      partitionKey: { name: PARTITION_KEY, type: AttributeType.STRING },
      sortKey: { name: SORT_KEY, type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: LAMBDA_HTTP_INTERCEPTOR_TABLE_NAME,
    });
  }
}
