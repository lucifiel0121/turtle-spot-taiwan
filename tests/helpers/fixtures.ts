import type { Activity } from "@/types/activity";

/**
 * Activity 測試 fixture 工廠：預設四欄位皆有值，
 * 個別測試以 overrides 覆寫（如 description: null 的組合案例）。
 */
export function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    title: "海龜點點名",
    description: "在花瓶岩目擊綠蠵龜",
    post_link: "https://example.com/post/1",
    date: "2024-10-29",
    ...overrides,
  };
}
