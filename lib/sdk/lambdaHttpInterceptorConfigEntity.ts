import {
  EntityV2,
  schema,
  string,
  map,
  boolean,
  number,
  any,
  record,
  list,
  PutItemInput,
} from "dynamodb-toolbox";

import { lambdaHttpInterceptorTable } from "./table";

const lambdaHttpInterceptorConfigSchema = schema({
  lambdaName: string().key().savedAs("PK"),
  entityName: string().key().const("lambdaHttpInterceptorConfig").savedAs("SK"),
  mockConfigs: list(
    map({
      url: string().optional(),
      method: string().optional(),
      body: string().optional(),
      headers: record(string(), string()).optional(),
      queryParams: record(string(), string()).optional(),
      response: map({
        status: number(),
        passThrough: boolean().optional(),
        headers: record(string(), any()).optional(),
        body: string().optional(),
        statusText: string().optional(),
      }),
    }),
  ),
});

export const lambdaHttpInterceptorConfigEntity = new EntityV2({
  name: "LambdaHttpInterceptorConfigEntity",
  table: lambdaHttpInterceptorTable,
  schema: lambdaHttpInterceptorConfigSchema,
});

export type LambdaHttpInterceptorConfig = PutItemInput<
  typeof lambdaHttpInterceptorConfigEntity
>;
