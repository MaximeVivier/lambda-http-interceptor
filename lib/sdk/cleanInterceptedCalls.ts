import { DeleteItemCommand } from 'dynamodb-toolbox';
import { interceptedCallEntity } from './lambdaHttpInterceptorInterceptedCallEntity';
import { listInterceptedCallsPkAndSk } from './fetchInterceptedCalls';

export const cleanInterceptedCalls = async (lambdaName: string) => {
  const interceptedCallsPkAndSk = await listInterceptedCallsPkAndSk(lambdaName);
  await Promise.all(
    interceptedCallsPkAndSk.map(async recordToDelete => {
      const command = new DeleteItemCommand(interceptedCallEntity, {
        lambdaName: recordToDelete.PK,
        entityName: recordToDelete.SK,
      });

      await command.send();
    }),
  );
};
