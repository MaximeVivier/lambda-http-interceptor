import {
  EntityV2,
  schema,
  string,
  map,
  number,
  record,
  PutItemInput,
  FormattedItem,
} from 'dynamodb-toolbox';
import { ulid } from 'ulid';

import { lambdaHttpInterceptorTable } from './table';
import { TTL_ATTRIBUTE_NAME, getDefaultTtl } from '../dynamoDbToolboxUtils';

export const interceptedCallEntityStartName = 'interceptedCall';

const getInterceptedCallEntityName = (): string =>
  `${interceptedCallEntityStartName}#${ulid()}`;

const interceptedCallSchema = schema({
  lambdaName: string().key().savedAs('PK'),
  entityName: string()
    .key()
    .default(getInterceptedCallEntityName)
    .savedAs('SK'),
  callParams: map({
    url: string(),
    method: string(),
    body: string().optional(),
    headers: record(string(), string()).optional(),
    queryParams: record(string(), string()).optional(),
  }),

  [TTL_ATTRIBUTE_NAME]: number().default(getDefaultTtl),
});

export const interceptedCallEntity = new EntityV2({
  name: 'interceptedCallEntity',
  table: lambdaHttpInterceptorTable,
  schema: interceptedCallSchema,
});

export type InterceptedCallInput = PutItemInput<typeof interceptedCallEntity>;

export type InterceptedCall = FormattedItem<typeof interceptedCallEntity>;
