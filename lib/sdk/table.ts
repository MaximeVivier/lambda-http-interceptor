import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
// Will be renamed Table in the official release 😉
import { TableV2 } from 'dynamodb-toolbox';

const dynamoDBClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const lambdaHttpInterceptorTable = new TableV2({
  name: process.env.HTTP_INTERCEPTOR_TABLE_NAME ?? 'NeverUsed',
  partitionKey: {
    name: 'PK',
    type: 'string', // 'string' | 'number' | 'binary'
  },
  sortKey: {
    name: 'SK',
    type: 'string',
  },
  documentClient,
});
