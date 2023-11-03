import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import {
  PARTITION_KEY,
  SORT_KEY,
  TTL_ATTRIBUTE_NAME,
} from '../dynamoDbToolboxUtils';
import { HttpInterceptorExtension } from './HttpInterceptorExtension';

type Props = {
  configTableName?: string;
};
export class HttpInterceptor extends Construct {
  public readonly extension: HttpInterceptorExtension;
  public readonly table: Table;
  constructor(scope: Construct, id: string, props?: Props) {
    super(scope, id);
    this.extension = new HttpInterceptorExtension(this, `${id}Extension`);

    this.table = new Table(this, 'ConfigTable', {
      partitionKey: { name: PARTITION_KEY, type: AttributeType.STRING },
      sortKey: { name: SORT_KEY, type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: props?.configTableName,
      timeToLiveAttribute: TTL_ATTRIBUTE_NAME,
    });
  }
}
