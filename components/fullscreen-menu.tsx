import { useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";

import { SectionContainer } from "@/components/layout/section";

type FullscreenMenuProps = {
  readonly open: boolean;
  readonly onClose: () => void;
};

/** 單頁筆試題目：設計稿未定義各連結目的地，href 先以 "#" 佔位。 */
const PLACEHOLDER_HREF = "#";

const NAV_ITEMS = [
  { zh: "海龜地圖", en: "Map" },
  { zh: "文章分享", en: "Article" },
  { zh: "關於我們", en: "About" },
  { zh: "教育資源", en: "Resources" },
  { zh: "目擊回報", en: "Report Sightings" },
] as const;

const CONTACT_EMAIL = "info@gmail.com";

const SOCIAL_LINKS = ["facebook", "instagram"] as const;

/** 開啟時鎖住 body scroll，關閉／卸載時還原原值。 */
function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}

/** Esc 關閉選單；cleanup 移除 listener。 */
function useEscapeToClose(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [active, onClose]);
}

/** 開啟時 focus 移入覆蓋層，關閉後 focus 回原觸發元素（menu 鈕）。 */
function useFocusOnOpen(
  open: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    containerRef.current?.focus();
    return () => previousFocus?.focus();
  }, [open, containerRef]);
}

type MenuInfoBlockProps = {
  readonly title: string;
  readonly children: ReactNode;
};

function MenuInfoBlock({ title, children }: MenuInfoBlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-white/60">{title}</p>
      <div className="flex gap-6 font-display text-base font-medium">
        {children}
      </div>
    </div>
  );
}

/**
 * S2.2 全螢幕選單：深色（ink）覆蓋層。
 * - z-40 蓋住頁面內容；navbar header 為 z-50，menu 鈕維持可點（再點即關閉）
 * - 導覽項 Desktop(xl) 橫排、Pad/Mobile 直排；每項＝中文小字 + 英文大字
 */
export function FullscreenMenu({ open, onClose }: FullscreenMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useEscapeToClose(open, onClose);
  useFocusOnOpen(open, containerRef);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="全站導覽選單"
      tabIndex={-1}
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink pt-10 text-white outline-none xl:pt-16"
    >
      <SectionContainer className="flex flex-1 flex-col justify-between gap-12 py-10 md:py-14 xl:py-16">
        <nav aria-label="主要導覽">
          <ul className="flex flex-col gap-8 md:gap-10 xl:flex-row xl:items-baseline xl:justify-between xl:gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.en}>
                <a href={PLACEHOLDER_HREF} className="block">
                  <span className="block text-sm text-white/60">{item.zh}</span>
                  <span className="mt-1 block font-display text-4xl font-semibold md:text-5xl xl:text-4xl">
                    {item.en}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-8 md:flex-row md:gap-24">
          <MenuInfoBlock title="聯絡我們">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </MenuInfoBlock>
          <MenuInfoBlock title="追蹤我們">
            {SOCIAL_LINKS.map((name) => (
              <a key={name} href={PLACEHOLDER_HREF}>
                {name}
              </a>
            ))}
          </MenuInfoBlock>
        </div>
      </SectionContainer>
    </div>
  );
}
