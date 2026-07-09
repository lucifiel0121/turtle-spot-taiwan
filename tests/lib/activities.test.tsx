import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ACTIVITIES_QUERY, fetchActivities, useActivities } from "@/lib/activities";
import { makeActivity } from "../helpers/fixtures";
import { graphqlRequestMock as requestMock } from "../helpers/graphql-mock";
import { createSwrWrapper } from "../helpers/swr";

vi.mock("@/lib/graphql", async () => {
  const helper = await import("../helpers/graphql-mock");
  return helper.mockGraphqlModule();
});

const ACTIVITY = makeActivity();

beforeEach(() => {
  requestMock.mockReset();
});

describe("fetchActivities", () => {
  it("以 ACTIVITIES_QUERY 呼叫 graphql client 並回傳 activities", async () => {
    requestMock.mockResolvedValue({ activities: [ACTIVITY] });

    const result = await fetchActivities();

    expect(requestMock).toHaveBeenCalledWith(ACTIVITIES_QUERY);
    expect(result).toEqual([ACTIVITY]);
  });
});

describe("useActivities", () => {
  it("fallbackData 路徑：首屏即有資料、無 loading", async () => {
    requestMock.mockResolvedValue({ activities: [ACTIVITY] });

    const { result } = renderHook(() => useActivities([ACTIVITY]), {
      wrapper: createSwrWrapper(),
    });

    // 首屏（尚未 revalidate 完成）即以 fallback 呈現，無空窗
    expect(result.current.activities).toEqual([ACTIVITY]);
    expect(result.current.error).toBeUndefined();
    // 背景 revalidate 完成後資料仍在、loading 結束
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(requestMock).toHaveBeenCalled();
    expect(result.current.activities).toEqual([ACTIVITY]);
  });

  it("無 fallback：先 loading（空陣列），fetch 完成後有資料", async () => {
    requestMock.mockResolvedValue({ activities: [ACTIVITY] });

    const { result } = renderHook(() => useActivities(), {
      wrapper: createSwrWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activities).toEqual([]);
    await waitFor(() =>
      expect(result.current.activities).toEqual([ACTIVITY]),
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("fetch 失敗：回傳 error、activities 保持空陣列", async () => {
    requestMock.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useActivities(), {
      wrapper: createSwrWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.activities).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
