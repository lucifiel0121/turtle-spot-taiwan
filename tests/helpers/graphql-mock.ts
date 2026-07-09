import { vi } from "vitest";

/**
 * @/lib/graphql 的共用測試替身（阻斷真實網路；SWR revalidate 也會打）。
 *
 * vi.mock factory 會被 hoist、不能引用測試檔頂層變數，
 * 故沿用 embla-mock 的 async import pattern，於 factory 內動態載入本模組：
 *
 *   vi.mock("@/lib/graphql", async () => {
 *     const helper = await import("../helpers/graphql-mock");
 *     return helper.mockGraphqlModule();
 *   });
 *
 * 測試檔另 import graphqlRequestMock 控制回傳值與斷言呼叫。
 */
export const graphqlRequestMock = vi.fn();

export function mockGraphqlModule() {
  return {
    graphqlClient: {
      request: (...args: unknown[]) => graphqlRequestMock(...args),
    },
  };
}
