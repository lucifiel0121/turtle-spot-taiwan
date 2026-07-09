import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Breakpoint 對映決策（設計稿三尺寸 frame → Tailwind v4 預設 breakpoints）：
 * - Mobile 375   → base（無前綴）
 * - Pad 768      → md:（Tailwind 預設 md=768px，與 Pad frame 同寬）
 * - Desktop 1440 → xl:（1280px 啟用；1440 是 Figma 畫布寬，
 *   內容實為置中 container，故不自訂 --breakpoint-*，沿用預設）
 */
export const BREAKPOINT_MAP = {
  mobile: "base (<768px)",
  pad: "md (>=768px)",
  desktop: "xl (>=1280px)",
} as const;

const SECTION_BACKGROUNDS = {
  brand: "bg-brand",
  "brand-soft": "bg-brand-soft",
  foam: "bg-foam",
  "surface-mist": "bg-surface-mist",
  "surface-card": "bg-surface-card",
  ink: "bg-ink",
} as const;

const SECTION_PADDINGS = {
  none: "",
  compact: "py-6 md:py-8 xl:py-10",
  default: "py-12 md:py-16 xl:py-20",
  spacious: "py-16 md:py-24 xl:py-32",
} as const;

export type SectionBackground = keyof typeof SECTION_BACKGROUNDS;
export type SectionPadding = keyof typeof SECTION_PADDINGS;

type SectionProps = {
  readonly id?: string;
  readonly background: SectionBackground;
  readonly padding?: SectionPadding;
  readonly as?: ElementType;
  readonly className?: string;
  readonly children: ReactNode;
};

/**
 * 全頁共用的色帶 section wrapper：
 * 背景一律走 @theme 語意化 token，禁止在頁面層寫死色碼。
 */
export function Section({
  id,
  background,
  padding = "default",
  as: Tag = "section",
  className,
  children,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "w-full",
        SECTION_BACKGROUNDS[background],
        SECTION_PADDINGS[padding],
        className,
      )}
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
