import { describe, expect, it } from "vitest";

import { formatActivityDate } from "@/lib/format-date";

describe("formatActivityDate", () => {
  it("將 ISO 日期 YYYY-MM-DD 轉為 YYYY/MM/DD", () => {
    expect(formatActivityDate("2024-10-29")).toBe("2024/10/29");
  });

  it("邊界日期（年初、年末、閏日）正常轉換", () => {
    expect(formatActivityDate("2024-01-01")).toBe("2024/01/01");
    expect(formatActivityDate("2024-12-31")).toBe("2024/12/31");
    expect(formatActivityDate("2024-02-29")).toBe("2024/02/29");
    expect(formatActivityDate("0001-01-01")).toBe("0001/01/01");
  });

  it("非法格式原樣返回（防禦，不丟錯）", () => {
    expect(formatActivityDate("2024/10/29")).toBe("2024/10/29");
    expect(formatActivityDate("not a date")).toBe("not a date");
    expect(formatActivityDate("")).toBe("");
    expect(formatActivityDate("2024-1-2")).toBe("2024-1-2");
    expect(formatActivityDate("2024-10-29T00:00:00Z")).toBe(
      "2024-10-29T00:00:00Z",
    );
    expect(formatActivityDate(" 2024-10-29")).toBe(" 2024-10-29");
  });
});
