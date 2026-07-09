import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// 未開 vitest globals 時 RTL 不會自動註冊 cleanup，須手動掛上
afterEach(cleanup);

/**
 * jsdom 未實作 window.matchMedia（photo-carousel 以其偵測
 * prefers-reduced-motion）。預設回傳 matches: false（不減速），
 * 個別測試可用 setMatchMediaMatches 覆寫。
 */
let matchMediaMatches = false;

export function setMatchMediaMatches(matches: boolean): void {
  matchMediaMatches = matches;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: matchMediaMatches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  matchMediaMatches = false;
});
