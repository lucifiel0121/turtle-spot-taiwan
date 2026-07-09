import type { NextApiRequest, NextApiResponse } from "next";
import { describe, expect, it, vi } from "vitest";

import handler from "@/pages/api/hello";

describe("GET /api/hello", () => {
  it("回傳 200 與固定 payload", () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = { status } as unknown as NextApiResponse<{ name: string }>;

    handler({} as NextApiRequest, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ name: "John Doe" });
  });
});
