import { useCallback, useState } from "react";
import { vi } from "vitest";

/**
 * embla-carousel-react 的單元測試替身。
 * jsdom 沒有版面（所有尺寸為 0），真 embla 無法產生 snap 位置，
 * 故以事件可控的 mock api 驗證 dots 對映 / autoplay handler 邏輯；
 * 實際捲動與 tween 視覺已由 headed 驗證涵蓋（S3.1 / S3.2）。
 */

type Listener = () => void;

function countSlides(root: HTMLElement | null): number {
  return root?.querySelectorAll("[data-slot='carousel-item']").length ?? 0;
}

export function createMockEmblaApi(root: HTMLElement) {
  const listeners = new Map<string, Set<Listener>>();
  const autoplay = { play: vi.fn(), stop: vi.fn() };
  let selected = 0;

  const emit = (event: string): void => {
    for (const listener of listeners.get(event) ?? []) listener();
  };
  const select = (index: number): void => {
    selected = index;
    emit("select");
  };

  const api = {
    emit,
    on(event: string, listener: Listener) {
      const set = listeners.get(event) ?? new Set<Listener>();
      set.add(listener);
      listeners.set(event, set);
      return api;
    },
    off(event: string, listener: Listener) {
      listeners.get(event)?.delete(listener);
      return api;
    },
    scrollSnapList: () =>
      Array.from({ length: countSlides(root) }, (_, i) => i),
    selectedScrollSnap: () => selected,
    scrollTo: vi.fn(select),
    scrollPrev: vi.fn(() =>
      select((selected - 1 + countSlides(root)) % countSlides(root)),
    ),
    scrollNext: vi.fn(() => select((selected + 1) % countSlides(root))),
    canScrollPrev: () => true,
    canScrollNext: () => true,
    rootNode: () => root,
    plugins: () => ({ autoplay }),
    scrollProgress: () => 0,
    slideNodes: () =>
      Array.from(
        root.querySelectorAll<HTMLElement>("[data-slot='carousel-item']"),
      ),
    // tween 用最小 engine：loopPoints 造 target<0 / >0 / 0 三分支
    internalEngine: () => ({
      options: { loop: true },
      slideLooper: {
        loopPoints: [
          { index: 1, target: () => -1 },
          { index: 2, target: () => 1 },
          { index: 3, target: () => 0 },
        ],
      },
      slideRegistry: Array.from({ length: countSlides(root) }, (_, i) => [i]),
    }),
  };
  return api;
}

export type MockEmblaApi = ReturnType<typeof createMockEmblaApi>;

let lastApi: MockEmblaApi | null = null;

export function getLastEmblaApi(): MockEmblaApi {
  if (!lastApi) throw new Error("mock embla api 尚未建立（元件未 mount？）");
  return lastApi;
}

export function resetLastEmblaApi(): void {
  lastApi = null;
}

/** 取代 useEmblaCarousel：ref 掛上後即提供 mock api。 */
export function useMockEmblaCarousel() {
  const [api, setApi] = useState<MockEmblaApi | undefined>(undefined);
  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setApi((prev) => {
      if (prev) return prev;
      const created = createMockEmblaApi(node);
      lastApi = created;
      return created;
    });
  }, []);
  return [ref, api] as const;
}
