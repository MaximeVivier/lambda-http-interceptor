import { PutItemCommand } from "dynamodb-toolbox";
import {
  lambdaHttpInterceptorConfigEntity,
  LambdaHttpInterceptorConfig,
} from "./lambdaHttpInterceptorConfigEntity";

export const setupLambdaHttpInterceptorConfig = async (
  params: LambdaHttpInterceptorConfig
) => {
  const command = new PutItemCommand(lambdaHttpInterceptorConfigEntity, params);

  await command.send();
};
