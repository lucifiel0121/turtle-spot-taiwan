import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PhotoCarousel } from "@/components/sections/photo-carousel";
import { PHOTO_CAROUSEL_SLIDES } from "@/content/photo-carousel";
import {
  getLastEmblaApi,
  resetLastEmblaApi,
} from "../helpers/embla-mock";
import { setMatchMediaMatches } from "../setup";

/**
 * Embla 在 jsdom 無版面（尺寸皆 0）無法真實捲動，
 * 深度互動已由 headed 驗證（S3.1/S3.2）；此處以 mock api
 * 驗證 dots 對映與 autoplay 暫停/恢復 handler 邏輯。
 */
vi.mock("embla-carousel-react", async () => {
  const helper = await import("../helpers/embla-mock");
  return { default: helper.mockUseEmblaCarousel };
});

const SLIDE_COUNT = PHOTO_CAROUSEL_SLIDES.length;

beforeEach(() => {
  resetLastEmblaApi();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PhotoCarousel dots 對映", () => {
  it("dots 數量 = snap 數量，初始第 1 顆為當前", () => {
    render(<PhotoCarousel />);
    const dots = Array.from({ length: SLIDE_COUNT }, (_, i) =>
      screen.getByRole("button", { name: `切換至第 ${i + 1} 張照片` }),
    );
    expect(dots).toHaveLength(SLIDE_COUNT);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    expect(dots[1]).toHaveAttribute("aria-current", "false");
  });

  it("點 dot 呼叫 api.scrollTo，select 事件後 aria-current 移動", async () => {
    const user = userEvent.setup();
    render(<PhotoCarousel />);
    const api = getLastEmblaApi();

    await user.click(
      screen.getByRole("button", { name: "切換至第 3 張照片" }),
    );

    expect(api.scrollTo).toHaveBeenCalledWith(2);
    expect(
      screen.getByRole("button", { name: "切換至第 3 張照片" }),
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: "切換至第 1 張照片" }),
    ).toHaveAttribute("aria-current", "false");
  });

  it("外部 select 事件（如箭頭換頁）同步 dots 狀態", () => {
    render(<PhotoCarousel />);
    const api = getLastEmblaApi();

    fireEvent.click(screen.getAllByRole("button", { name: "Next slide" })[0]);

    expect(api.scrollNext).toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "切換至第 2 張照片" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("所有 slide 圖片與 alt 都渲染", () => {
    render(<PhotoCarousel />);
    for (const slide of PHOTO_CAROUSEL_SLIDES) {
      expect(screen.getAllByAltText(slide.alt).length).toBeGreaterThan(0);
    }
  });
});

describe("PhotoCarousel autoplay 暫停 / 閒置恢復", () => {
  it("載入即 play；互動 stop；閒置 6 秒後恢復 play", () => {
    vi.useFakeTimers();
    const { container } = render(<PhotoCarousel />);
    const autoplay = getLastEmblaApi().plugins().autoplay;
    expect(autoplay.play).toHaveBeenCalledTimes(1);

    const region = container.querySelector("[data-slot='carousel']");
    expect(region).not.toBeNull();
    fireEvent.pointerDown(region as Element);
    expect(autoplay.stop).toHaveBeenCalledTimes(1);
    expect(autoplay.play).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(6000);
    expect(autoplay.play).toHaveBeenCalledTimes(2);
  });

  it("連續互動重置 idle timer，未滿閒置時間不恢復", () => {
    vi.useFakeTimers();
    const { container } = render(<PhotoCarousel />);
    const autoplay = getLastEmblaApi().plugins().autoplay;
    const region = container.querySelector("[data-slot='carousel']") as Element;

    fireEvent.pointerDown(region);
    vi.advanceTimersByTime(4000);
    fireEvent.keyDown(region, { key: "ArrowRight" });
    vi.advanceTimersByTime(4000);
    // 距最後一次互動僅 4 秒，尚未恢復
    expect(autoplay.play).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    expect(autoplay.play).toHaveBeenCalledTimes(2);
  });

  it("prefers-reduced-motion: reduce 時不啟動 autoplay", () => {
    setMatchMediaMatches(true);
    render(<PhotoCarousel />);
    const autoplay = getLastEmblaApi().plugins().autoplay;
    expect(autoplay.play).not.toHaveBeenCalled();
  });

  it("unmount 清掉 listener 與 timer（不再恢復 play）", () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<PhotoCarousel />);
    const api = getLastEmblaApi();
    const autoplay = api.plugins().autoplay;
    const region = container.querySelector("[data-slot='carousel']") as Element;

    fireEvent.pointerDown(region);
    unmount();
    vi.advanceTimersByTime(10000);
    act(() => api.emit("reInit"));
    expect(autoplay.play).toHaveBeenCalledTimes(1);
  });
});

/**
 * S5.6 缺陷 1 回歸：menu 的 body scroll-lock 造成版面寬變化 → embla reInit
 * → plugin 重建為停止狀態且 playOnInit: false 不自行重啟。
 * 修復後 controller 監聽 reInit 接手恢復播放。
 */
describe("PhotoCarousel reInit 後恢復 autoplay", () => {
  it("reInit（如 menu 開關造成版面寬變化）後重新 play", () => {
    render(<PhotoCarousel />);
    const api = getLastEmblaApi();
    const autoplay = api.plugins().autoplay;
    expect(autoplay.play).toHaveBeenCalledTimes(1);

    act(() => api.emit("reInit"));
    expect(autoplay.play).toHaveBeenCalledTimes(2);
  });

  it("互動暫停等待期間 reInit 不插隊，仍由 idle timer 屆時恢復", () => {
    vi.useFakeTimers();
    const { container } = render(<PhotoCarousel />);
    const api = getLastEmblaApi();
    const autoplay = api.plugins().autoplay;
    const region = container.querySelector("[data-slot='carousel']") as Element;

    fireEvent.pointerDown(region);
    expect(autoplay.stop).toHaveBeenCalledTimes(1);
    act(() => api.emit("reInit"));
    // 閒置未滿 AUTOPLAY_RESUME_IDLE_MS，reInit 不得提前恢復
    expect(autoplay.play).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(6000);
    expect(autoplay.play).toHaveBeenCalledTimes(2);
  });

  it("prefers-reduced-motion: reduce 時 reInit 也不啟動 autoplay", () => {
    setMatchMediaMatches(true);
    render(<PhotoCarousel />);
    const api = getLastEmblaApi();
    const autoplay = api.plugins().autoplay;

    act(() => api.emit("reInit"));
    expect(autoplay.play).not.toHaveBeenCalled();
  });
});
