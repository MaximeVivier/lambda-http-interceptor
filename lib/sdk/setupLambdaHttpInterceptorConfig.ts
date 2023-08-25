import { PutItemCommand } from "dynamodb-toolbox";
import {
  lambdaHttpInterceptorConfigEntity,
  LambdaHttpInterceptorConfigInput,
} from "./lambdaHttpInterceptorConfigEntity";

export const setupLambdaHttpInterceptorConfig = async (
  params: LambdaHttpInterceptorConfigInput,
) => {
  const command = new PutItemCommand(lambdaHttpInterceptorConfigEntity, params);

  await command.send();
};
