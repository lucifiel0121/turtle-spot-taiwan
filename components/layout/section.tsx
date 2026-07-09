import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Breakpoint 對映決策（設計稿三尺寸 frame → Tailwind v4 預設 breakpoints）：
 * - Mobile 375   → base（無前綴）
 * - Pad 768      → md:（Tailwind 預設 md=768px，與 Pad frame 同寬）
 * - Desktop 1440 → xl:（1280px 啟用；1440 是 Figma 畫布寬，
 *   內容實為置中 container，故不自訂 --breakpoint-*，沿用預設）
 */

const SECTION_BACKGROUNDS = {
  brand: "bg-brand",
  "brand-soft": "bg-brand-soft",
  foam: "bg-foam",
  "surface-mist": "bg-surface-mist",
  "surface-card": "bg-surface-card",
  ink: "bg-ink",
} as const;

export type SectionBackground = keyof typeof SECTION_BACKGROUNDS;

type SectionProps = {
  readonly id?: string;
  readonly background: SectionBackground;
  readonly as?: ElementType;
  readonly className?: string;
  readonly children: ReactNode;
};

/**
 * 全頁共用的色帶 section wrapper：
 * 背景一律走 @theme 語意化 token，禁止在頁面層寫死色碼。
 * 不提供 padding 檔位：全頁各 section 內距皆依截圖量測由內容自控，
 * 齊一 padding 檔位在本設計中無使用場景。
 */
export function Section({
  id,
  background,
  as: Tag = "section",
  className,
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn("w-full", SECTION_BACKGROUNDS[background], className)}
    >
      {children}
    </Tag>
  );
}

type SectionContainerProps = {
  readonly className?: string;
  readonly children: ReactNode;
};

/** 置中內容 container：Desktop 1440 畫布下內容寬以 xl container 收斂。 */
export function SectionContainer({
  className,
  children,
}: SectionContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 md:px-8", className)}>
      {children}
    </div>
  );
}
