import { useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";

import { SectionContainer } from "@/components/layout/section";
import {
  MENU_CONTACT_EMAIL,
  MENU_CONTACT_TITLE,
  MENU_FOLLOW_TITLE,
  MENU_NAV_ITEMS,
  MENU_SOCIAL_LINKS,
} from "@/content/menu";
import { cn } from "@/lib/utils";

type FullscreenMenuProps = {
  readonly open: boolean;
  readonly onClose: () => void;
};

/** 單頁筆試題目：設計稿未定義各連結目的地，href 先以 "#" 佔位。 */
const PLACEHOLDER_HREF = "#";

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

/** focus trap 循環對象：覆蓋層內可聚焦元素（本選單僅含連結與按鈕）。 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus trap（aria-modal 對應行為）：Tab / Shift+Tab 在覆蓋層內循環，
 * 不跑出蓋在底下的頁面內容。自寫小 hook、不引入依賴。
 */
function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusables =
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;
      if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (current === first || current === container)) {
        event.preventDefault();
        last.focus();
      }
    };
    container.addEventListener("keydown", handleKeydown);
    return () => container.removeEventListener("keydown", handleKeydown);
  }, [active, containerRef]);
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
    <div className="flex flex-col items-end gap-2 text-right xl:items-start xl:text-left">
      {/* Figma menu：標題後接一段短分隔線（「聯絡我們 —」「追蹤我們 —」）。 */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-white/60">{title}</p>
        <span className="h-px w-8 bg-white/30" aria-hidden="true" />
      </div>
      <div className="flex items-center justify-end gap-3 font-display text-base font-medium xl:justify-start">
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
  useFocusTrap(open, containerRef);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="全站導覽選單"
      tabIndex={-1}
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-brand text-white outline-none"
    >
      {/* 深色內容面板：底部大圓角，露出下緣青色帶（Figma menu 設計，Image #2）。 */}
      <div className="flex min-h-[80%] flex-col rounded-b-[32px] bg-ink pt-10 md:rounded-b-[40px] xl:rounded-b-[48px] xl:pt-16">
        <SectionContainer className="flex flex-1 flex-col justify-between gap-12 py-10 md:py-14 xl:justify-end xl:gap-16 xl:py-16">
        <nav aria-label="主要導覽">
          <ul className="flex flex-col items-end gap-8 text-right md:gap-10 xl:flex-row xl:items-baseline xl:justify-between xl:gap-6 xl:text-left">
            {MENU_NAV_ITEMS.map((item, index) => (
              <li key={item.en}>
                <a href={PLACEHOLDER_HREF} className="group block">
                  <span className="block text-sm text-white/60">{item.zh}</span>
                  <span
                    className={cn(
                      "mt-1 block font-display text-4xl font-semibold transition-colors group-hover:text-brand md:text-5xl xl:text-4xl",
                      // Figma menu 稿首項（Map）為品牌青色高亮
                      index === 0 && "text-brand",
                    )}
                  >
                    {item.en}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col items-end gap-8 xl:flex-row xl:items-start xl:justify-start xl:gap-24">
          <MenuInfoBlock title={MENU_CONTACT_TITLE}>
            <a href={`mailto:${MENU_CONTACT_EMAIL}`}>{MENU_CONTACT_EMAIL}</a>
          </MenuInfoBlock>
          <MenuInfoBlock title={MENU_FOLLOW_TITLE}>
            {MENU_SOCIAL_LINKS.map((name, index) => (
              <span key={name} className="contents">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-white/40">
                    /
                  </span>
                ) : null}
                <a href={PLACEHOLDER_HREF}>{name}</a>
              </span>
            ))}
          </MenuInfoBlock>
        </div>
        </SectionContainer>
      </div>
    </div>
  );
}
