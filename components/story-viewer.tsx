import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/**
 * S3.3 類 IG 限時動態 viewer（自製，不用套件）。
 * 導覽邏輯以純函式（wrapIndex / resolveSwipeDirection）分離，供 S4.2 單元測試。
 *
 * 卡片量測（Figma Desktop 1440 整頁截圖，1407px 原圖 × 1.0235 換算）：
 * - 黑卡（--color-ink）約 558x680，頂部圓角約 32、底部平角（貼齊 footer 色帶）
 * - progress dots：10 條橫桿均分（高 4、圓端、左右 padding 20、間距 8），
 *   當前頁 foam 白、其餘暗灰（截圖取樣 ≈ #383c46，以 ink-soft/60 近似）
 * - 左右箭頭：黑圓（ink）直徑約 70、白 chevron，垂直置中對齊卡片，
 *   距卡片邊緣約 46；設計稿箭頭恆顯示、無 disabled 樣式線索 → 首末頁採
 *   loop 循環（與 photo-carousel loop:true 慣例一致）
 * - S4.1 Pad/Mobile 設計稿校正（768/375 整頁縮圖）：卡片 Pad ≈507x676 /
 *   Mobile ≈306x490；Pad 箭頭直徑 ≈76、距卡緣 ≈12；Mobile 設計稿無側邊
 *   箭頭（導覽靠 swipe 與 dots）→ 箭頭 md 起才顯示
 */

/** 手勢判定：水平位移達此門檻才視為換頁滑動。 */
export const SWIPE_THRESHOLD_PX = 50;

/**
 * story 卡尺寸／底色／頂部圓角（三檔 RWD 量測值見檔頭註解）。
 * viewer 本體與 witness-story 三態佔位卡（StoryStatusCard）共用，
 * 確保載入／錯誤／空資料時卡片尺寸與有資料時一致。
 */
export const STORY_CARD_CLASS =
  "h-[490px] w-[306px] rounded-t-3xl bg-ink md:h-[676px] md:w-[507px] xl:h-[680px] xl:w-[558px] xl:rounded-t-[32px]";

export type StoryDirection = "prev" | "next";

/** 循環換頁 index（首末頁 loop 決策依據見檔頭量測註解）。 */
export function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * 收斂 index 至合法範圍（SWR revalidation 使 items 縮減時的防呆）：
 * 超出上界 clamp 到末筆，不 wrap — 停留在「最接近原位置」的資料上。
 */
export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(index, 0), count - 1);
}

/**
 * 手勢意圖判定（純函式）：|dx| >= 門檻且 |dx| > |dy|（水平主導）才回傳方向；
 * 斜向／垂直滑動回傳 null，不與頁面垂直捲動衝突。向左滑 = 下一頁。
 */
export function resolveSwipeDirection(
  deltaX: number,
  deltaY: number,
  threshold: number = SWIPE_THRESHOLD_PX,
): StoryDirection | null {
  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) {
    return null;
  }
  return deltaX < 0 ? "next" : "prev";
}

/**
 * Pointer events 手勢導覽：卡片掛 touch-pan-y，垂直捲動仍交還瀏覽器
 * （瀏覽器接手捲動時發 pointercancel，起點被清空、不誤觸換頁）。
 * - pointerdown 時 setPointerCapture：滑鼠拖出卡片邊界放開仍收得到
 *   pointerup（jsdom 無此 API，optional call 防呆）
 * - swipe 成立時一次性抑制後續 click（capture phase）：拖曳起訖都落在
 *   VIEW POST anchor 上時，換頁與開新分頁不再同時發生
 */
function useSwipeNavigation(step: (direction: StoryDirection) => void) {
  const start = useRef<{ readonly x: number; readonly y: number } | null>(
    null,
  );
  const suppressClick = useRef(false);

  const onPointerDown = useCallback((event: ReactPointerEvent) => {
    // 新手勢開始即歸零抑制 flag：swipe 後未跟進 click 時不殘留到下一次真 click
    suppressClick.current = false;
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, []);

  const onPointerUp = useCallback(
    (event: ReactPointerEvent) => {
      const origin = start.current;
      start.current = null;
      if (!origin) return;
      const direction = resolveSwipeDirection(
        event.clientX - origin.x,
        event.clientY - origin.y,
      );
      if (!direction) return;
      suppressClick.current = true;
      step(direction);
    },
    [step],
  );

  const onPointerCancel = useCallback(() => {
    start.current = null;
  }, []);

  const onClickCapture = useCallback((event: ReactMouseEvent) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return { onPointerDown, onPointerUp, onPointerCancel, onClickCapture };
}

type ProgressDotsProps = {
  readonly count: number;
  readonly current: number;
  readonly onSelect: (index: number) => void;
};

/** 頂部進度橫桿：數量 = 資料筆數、當前高亮、可點跳頁（hit area 高於視覺桿）。 */
function ProgressDots({ count, current, onSelect }: ProgressDotsProps) {
  return (
    <div className="flex gap-1.5 px-4 pt-4 md:px-5 md:pt-6 xl:gap-2 xl:pt-8">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`跳至第 ${index + 1} 則`}
          aria-current={index === current}
          onClick={() => onSelect(index)}
          className="flex h-4 flex-1 items-center"
        >
          <span
            className={cn(
              "h-1 w-full rounded-full transition-colors duration-300",
              index === current ? "bg-foam" : "bg-ink-soft/60",
            )}
          />
        </button>
      ))}
    </div>
  );
}

type ArrowButtonProps = {
  readonly direction: StoryDirection;
  readonly onClick: () => void;
};

/** 卡片外側箭頭：黑圓白 chevron（截圖為準），垂直置中對齊卡片。 */
function ArrowButton({ direction, onClick }: ArrowButtonProps) {
  const Icon = direction === "next" ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "next" ? "下一則" : "上一則"}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-foam transition-opacity hover:opacity-85",
        "hidden md:flex md:size-[76px] xl:size-[70px]",
        direction === "next"
          ? "left-full md:ml-3 xl:ml-[46px]"
          : "right-full md:mr-3 xl:mr-[46px]",
      )}
    >
      <Icon className="size-8" aria-hidden="true" />
    </button>
  );
}

type StoryView = {
  readonly index: number;
  readonly direction: StoryDirection;
};

type StoryViewerProps<T> = {
  /** 動態資料；dots 數量與換頁範圍由筆數決定（S3.4 直接餵 Activity[]）。 */
  readonly items: ReadonlyArray<T>;
  /** 內容區渲染（dots 與頭像列之下、動作列之上），每次換頁重播進場動畫。 */
  readonly renderItem: (item: T, index: number) => ReactNode;
  /** 卡片頂部頭像列（dots 之下）。 */
  readonly header?: ReactNode;
  /** 底部動作列（VIEW POST）；S3.4 由 post_link 提供連結。 */
  readonly renderAction?: (item: T, index: number) => ReactNode;
  /** 無障礙區域名稱。 */
  readonly label?: string;
  readonly className?: string;
};

/** 類 IG 限時動態 viewer：dots 連動、外側箭頭、swipe 手勢、換頁進場動畫。 */
export function StoryViewer<T>({
  items,
  renderItem,
  header,
  renderAction,
  label,
  className,
}: StoryViewerProps<T>) {
  const [view, setView] = useState<StoryView>({ index: 0, direction: "next" });

  const step = useCallback(
    (direction: StoryDirection) => {
      const offset = direction === "next" ? 1 : -1;
      // 先 clamp 再位移：SWR revalidation 縮減 items 後，以畫面上實際顯示的
      // index 為換頁基準，避免 stale index 造成跳頁不連續
      setView((prev) => ({
        index: wrapIndex(
          clampIndex(prev.index, items.length) + offset,
          items.length,
        ),
        direction,
      }));
    },
    [items.length],
  );

  const jumpTo = useCallback(
    (target: number) => {
      setView((prev) => ({
        index: wrapIndex(target, items.length),
        direction: target >= prev.index ? "next" : "prev",
      }));
    },
    [items.length],
  );

  const swipeHandlers = useSwipeNavigation(step);
  // 渲染用 index 以 items 當下筆數 clamp（derived，不 setState）：
  // SWR revalidation 使 items 縮減到少於 state index 時仍渲染合法末筆，
  // 不會整個 viewer 空白；items 為空陣列時維持既有的不渲染行為
  const index = clampIndex(view.index, items.length);
  const currentItem = items[index];
  if (currentItem === undefined) return null;

  // renderAction 回傳 null（如 post_link 為 null）時連容器一併不渲染，不留空殼 DOM
  const action = renderAction?.(currentItem, index) ?? null;

  return (
    <div className={cn("relative", className)}>
      <article
        role="region"
        aria-label={label}
        {...swipeHandlers}
        className={cn(
          STORY_CARD_CLASS,
          "flex touch-pan-y select-none flex-col overflow-hidden",
        )}
      >
        <ProgressDots count={items.length} current={index} onSelect={jumpTo} />
        {header}
        {/* key 換頁重掛載以重播進場動畫；transform+opacity only，reduced-motion 關閉 */}
        <div
          key={index}
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            "animate-in fade-in duration-500 motion-reduce:animate-none",
            view.direction === "next"
              ? "slide-in-from-right-8"
              : "slide-in-from-left-8",
          )}
        >
          {renderItem(currentItem, index)}
        </div>
        {action !== null ? (
          <div className="flex justify-center pb-8 md:pb-12 xl:pb-20">
            {action}
          </div>
        ) : null}
      </article>
      <ArrowButton direction="prev" onClick={() => step("prev")} />
      <ArrowButton direction="next" onClick={() => step("next")} />
    </div>
  );
}
