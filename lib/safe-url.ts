/**
 * S3.4 外部連結安全檢查（純函式，S4.2 單元測試對象）。
 * API post_link 屬不可信輸入，塞進 <a href> 前先過協定 allowlist，
 * 阻擋 javascript: / data: / vbscript: 等危險協定。
 */
const SAFE_PROTOCOLS: readonly string[] = ["http:", "https:"];

/** 僅絕對 http/https URL 回傳 true；相對路徑或 parse 失敗一律 false。 */
export function isSafeHttpUrl(url: string): boolean {
  try {
    return SAFE_PROTOCOLS.includes(new URL(url).protocol);
  } catch {
    return false;
  }
}
