import { PutItemCommand } from 'dynamodb-toolbox';
import {
  InterceptedCallInput,
  interceptedCallEntity,
} from './lambdaHttpInterceptorInterceptedCallEntity';

export const putInterceptedCall = async (params: InterceptedCallInput) => {
  const command = new PutItemCommand(interceptedCallEntity, params);

  await command.send();
};
