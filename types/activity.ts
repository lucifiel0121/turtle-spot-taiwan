/**
 * GraphQL Activity 型別（手寫，對應 schema：
 * Activity { title: String!, description: String, post_link: String, date: Date! }）
 * date 為 Date scalar，實測回傳格式為 "YYYY-MM-DD" 字串（2026-07-09 live 驗證）。
 */
export type Activity = {
  readonly title: string;
  readonly description: string | null;
  readonly post_link: string | null;
  readonly date: string;
};
