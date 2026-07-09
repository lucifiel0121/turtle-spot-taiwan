/**
 * S3.4 Activity 日期格式轉換（純函式，S4.2 單元測試對象）。
 * API Date scalar 實測回傳 "YYYY-MM-DD" 字串；設計稿顯示 "YYYY/MM/DD"。
 * 刻意用純字串轉換、不經 Date 物件：避免 UTC/本地時區位移把日期推前推後一天。
 */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** "2024-10-29" → "2024/10/29"；格式不符原樣返回（防禦，不丟錯）。 */
export function formatActivityDate(value: string): string {
  if (!ISO_DATE_PATTERN.test(value)) return value;
  return value.replaceAll("-", "/");
}
