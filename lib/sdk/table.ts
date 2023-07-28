import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { LAMBDA_HTTP_INTERCEPTOR_TABLE_NAME } from "../constants";
// Will be renamed Table in the official release 😉
import { TableV2 } from "dynamodb-toolbox";

const dynamoDBClient = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const lambdaHttpInterceptorTable = new TableV2({
  name: LAMBDA_HTTP_INTERCEPTOR_TABLE_NAME,
  partitionKey: {
    name: "PK",
    type: "string", // 'string' | 'number' | 'binary'
  },
  sortKey: {
    name: "SK",
    type: "string",
  },
  documentClient,
});
