import { Equal, Volume2, X } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";
import { cn } from "@/lib/utils";

type NavbarProps = {
  /** 切換 S2.2 全螢幕選單開關。 */
  readonly onMenuClick?: () => void;
  /** 全螢幕選單目前是否開啟（供 aria-expanded）。 */
  readonly menuOpen?: boolean;
};

/**
 * 全站 Navbar（Figma Desktop 1440 對齊）：
 * - 左半 brand-soft 底 + logo（四角取景框 mark + 站名）
 * - 右半 ink 深色塊（bottom-left 圓角），三鈕以 1px 分隔線隔開
 * - 高度 RWD：Desktop(xl) 64px / Pad・Mobile 40px
 * - S4.1 Pad/Mobile 設計稿（768/375 整頁縮圖）：MENU 鈕僅剩漢堡 icon，
 *   無 "MENU" 字樣 → 文字 xl 才顯示
 * language / sounds 鈕行為設計未定義，先渲染不接行為。
 */
export function Navbar({ onMenuClick, menuOpen = false }: NavbarProps) {
  return (
    <div className="flex h-10 w-full items-stretch justify-between xl:h-16">
      <Link
        href="/"
        className={cn(
          "flex items-center gap-1.5 pl-3 md:gap-2 md:pl-5 xl:gap-3",
          // 選單開啟時整條 navbar 轉深底（Figma menu-open：logo 轉白）
          menuOpen ? "text-white" : "text-ink",
        )}
        aria-label="Turtle Spot Taiwan home"
      >
        <LogoMark className="size-4 xl:size-6" />
        <span className="whitespace-nowrap font-display text-sm font-bold xl:text-xl">
          Turtle Spot Taiwan
        </span>
      </Link>
      {/* 右半深色塊文字取樣為純白（#fff）而非 foam 冷白、分隔線為白 10%，刻意不走 foam token 忠實截圖 */}
      <div className="flex items-stretch divide-x divide-white/10 rounded-bl-[10px] bg-ink font-display text-xs font-semibold tracking-[0.2em] text-white xl:text-sm">
        <button
          type="button"
          className="px-3 md:px-4 xl:px-6"
          aria-label="Switch language"
        >
          EN
        </button>
        <button
          type="button"
          className="px-3 md:px-4 xl:px-6"
          aria-label="Sounds"
        >
          <Volume2 className="size-4 xl:size-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onMenuClick}
          className="flex items-center gap-1.5 px-3 md:gap-2 md:px-4 xl:gap-2.5 xl:px-6"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <X className="size-4 xl:size-5" aria-hidden="true" />
          ) : (
            <Equal className="size-4 xl:size-5" aria-hidden="true" />
          )}
          <span className="hidden xl:inline">MENU</span>
        </button>
      </div>
    </div>
  );
}
