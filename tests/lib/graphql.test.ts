import { GraphQLClient } from "graphql-request";
import { describe, expect, it } from "vitest";

import { GRAPHQL_ENDPOINT, graphqlClient } from "@/lib/graphql";

describe("graphql client", () => {
  it("endpoint 指向筆試題公開 GraphQL API", () => {
    expect(GRAPHQL_ENDPOINT).toBe("https://f2e-test.simpleinfo.tw/graphql");
  });

  it("匯出可用的 GraphQLClient 實例", () => {
    expect(graphqlClient).toBeInstanceOf(GraphQLClient);
  });
});
