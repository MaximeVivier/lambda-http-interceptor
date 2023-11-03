import { PutItemCommand } from 'dynamodb-toolbox';
import { InterceptedCallInput, interceptedCallEntity } from './entity';

export const putInterceptedCall = async (params: InterceptedCallInput) => {
  const command = new PutItemCommand(interceptedCallEntity, params);

  await command.send();
};
