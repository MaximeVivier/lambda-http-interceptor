import {
  InterceptedCall,
  interceptedCallEntity,
  interceptedCallEntityStartName,
} from './lambdaHttpInterceptorInterceptedCallEntity';
import { InterceptedCallParams } from './types';
import { QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { PARTITION_KEY, SORT_KEY } from '../dynamoDbToolboxUtils';
import { lambdaHttpInterceptorTable } from './table';

export const fetchInterceptedCalls = async (
  lambdaName: string,
): Promise<InterceptedCallParams[]> => {
  // --- TODO: replace all this when ddbt qurey command will be available ----
  const queryInputCommand = {
    TableName: interceptedCallEntity.table.name,
    KeyConditionExpression: '#pk = :pkval and begins_with(#sk, :skval)',
    ExpressionAttributeNames: {
      '#pk': PARTITION_KEY, // Replace with your actual PK attribute name
      '#sk': SORT_KEY, // Replace with your actual SK attribute name
    },
    ExpressionAttributeValues: {
      ':pkval': lambdaName, // Replace with your actual PK value
      ':skval': interceptedCallEntityStartName, // Replace with your actual SK prefix
    },
  } satisfies QueryCommandInput;
  const command = new QueryCommand(queryInputCommand);

  const { Items: interceptedCalls } =
    (await lambdaHttpInterceptorTable.documentClient.send(
      command,
    )) as unknown as { Items?: InterceptedCall[] };

  // ------------------------------- END TODO -------------------------------

  if (interceptedCalls === undefined) return [];

  return interceptedCalls.map(({ callParams }) => callParams);
};
