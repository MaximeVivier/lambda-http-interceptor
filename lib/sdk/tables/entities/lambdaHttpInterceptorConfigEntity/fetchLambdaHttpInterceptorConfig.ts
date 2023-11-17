import { GetItemCommand } from 'dynamodb-toolbox';
import { MockConfig } from '../../../types';
import { lambdaHttpInterceptorConfigEntity } from './entity';
import { AWS_LAMBDA_FUNCTION_NAME, getEnv } from '../../../getEnv';

export const fetchLambdaHttpInterceptorConfig = async (): Promise<
  MockConfig[] | undefined
> => {
  const command = new GetItemCommand(lambdaHttpInterceptorConfigEntity, {
    lambdaName: getEnv(AWS_LAMBDA_FUNCTION_NAME),
  });

  const { Item } = await command.send();

  return Item?.mockConfigs;
};
