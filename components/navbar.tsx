import { Equal, Scan, Volume2 } from "lucide-react";

type NavbarProps = {
  /** S2.2 全螢幕選單接上前先 no-op。 */
  readonly onMenuClick?: () => void;
};

/**
 * 全站 Navbar（Figma Desktop 1440 對齊）：
 * - 左半 brand-soft 底 + logo（四角取景框 mark + 站名）
 * - 右半 ink 深色塊（bottom-left 圓角），三鈕以 1px 分隔線隔開
 * - 高度 RWD：Desktop(xl) 64px / Pad・Mobile 40px
 * language / sounds 鈕行為設計未定義，先渲染不接行為。
 */
export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <div className="flex h-10 w-full items-stretch justify-between xl:h-16">
      <a
        href="/"
        className="flex items-center gap-1.5 pl-3 text-ink md:gap-2 md:pl-5 xl:gap-3"
        aria-label="Turtle Spot Taiwan home"
      >
        <Scan
          className="size-4 xl:size-6"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <span className="whitespace-nowrap font-display text-sm font-bold xl:text-xl">
          Turtle Spot Taiwan
        </span>
      </a>
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
          {/* 設計稿的喇叭 icon 為純黑（比 ink 底更深），忠實重現 */}
          <Volume2 className="size-4 text-black xl:size-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onMenuClick}
          className="flex items-center gap-1.5 px-3 md:gap-2 md:px-4 xl:gap-2.5 xl:px-6"
          aria-label="Open menu"
        >
          <Equal className="size-4 xl:size-5" aria-hidden="true" />
          <span>MENU</span>
        </button>
      </div>
    </div>
  );
}
