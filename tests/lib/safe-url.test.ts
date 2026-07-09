import { describe, expect, it } from "vitest";

import { isSafeHttpUrl } from "@/lib/safe-url";

describe("isSafeHttpUrl", () => {
  it("絕對 http / https URL 回傳 true", () => {
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
    expect(isSafeHttpUrl("https://example.com/path?a=1#hash")).toBe(true);
    expect(isSafeHttpUrl("HTTPS://EXAMPLE.COM")).toBe(true);
  });

  it("危險協定回傳 false", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(
      false,
    );
    expect(isSafeHttpUrl("vbscript:msgbox(1)")).toBe(false);
  });

  it("非 http 系協定回傳 false", () => {
    expect(isSafeHttpUrl("ftp://example.com/file")).toBe(false);
    expect(isSafeHttpUrl("mailto:someone@example.com")).toBe(false);
  });

  it("相對路徑與 parse 失敗回傳 false", () => {
    expect(isSafeHttpUrl("/relative/path")).toBe(false);
    expect(isSafeHttpUrl("example.com")).toBe(false);
    expect(isSafeHttpUrl("")).toBe(false);
    expect(isSafeHttpUrl("http://")).toBe(false);
    expect(isSafeHttpUrl("://broken")).toBe(false);
  });
});
