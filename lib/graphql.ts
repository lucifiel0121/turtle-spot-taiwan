import { GraphQLClient } from "graphql-request";

/**
 * 筆試題公開 GraphQL endpoint（無需憑證），故直接以常數硬編。
 * 正式專案應改由環境變數（如 NEXT_PUBLIC_GRAPHQL_ENDPOINT）注入。
 */
export const GRAPHQL_ENDPOINT = "https://f2e-test.simpleinfo.tw/graphql";

export const graphqlClient = new GraphQLClient(GRAPHQL_ENDPOINT);
