import {
  EntityV2,
  schema,
  string,
  map,
  boolean,
  number,
  record,
  list,
  anyOf,
  PutItemInput,
  FormattedItem,
  PutItemCommand,
} from 'dynamodb-toolbox';

import { lambdaHttpInterceptorTable } from './table';
import { TTL_ATTRIBUTE_NAME } from '../constants';

const oneHourInSeconds = 3600;

const lambdaHttpInterceptorConfigSchema = schema({
  lambdaName: string().key().savedAs('PK'),
  entityName: string().key().const('lambdaHttpInterceptorConfig').savedAs('SK'),
  mockConfigs: list(
    map({
      url: string().optional(),
      method: string().optional(),
      body: string().optional(),
      headers: record(string(), string()).optional(),
      queryParams: record(string(), string()).optional(),
      response: anyOf([
        map({
          passThrough: boolean().enum(true),
        }),
        map({
          passThrough: boolean().enum(false).optional(),
          status: number(),
          headers: record(string(), string()).optional(),
          body: string().optional(),
        }),
      ]),
    }),
  ),
  [TTL_ATTRIBUTE_NAME]: number().default(
    () => Math.ceil(new Date().getTime() / 1000) + oneHourInSeconds,
  ),
});

export const lambdaHttpInterceptorConfigEntity = new EntityV2({
  name: 'LambdaHttpInterceptorConfigEntity',
  table: lambdaHttpInterceptorTable,
  schema: lambdaHttpInterceptorConfigSchema,
});

export type LambdaHttpInterceptorConfigInput = PutItemInput<
  typeof lambdaHttpInterceptorConfigEntity
>;

export type LambdaHttpInterceptorConfig = FormattedItem<
  typeof lambdaHttpInterceptorConfigEntity
>;
