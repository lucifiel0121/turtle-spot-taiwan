import { Scan } from "lucide-react";

import { Marquee } from "@/components/marquee";
import { StoryViewer } from "@/components/story-viewer";
import {
  WITNESS_ACTION_LABEL,
  WITNESS_HEADER_LABEL,
  WITNESS_MARQUEE_WORDS,
} from "@/content/witness-story";
import { useActivities } from "@/lib/activities";
import { formatActivityDate } from "@/lib/format-date";
import { isSafeHttpUrl } from "@/lib/safe-url";
import type { Activity } from "@/types/activity";

/**
 * S3.3 Witness story 段落量測（Figma Desktop 1440 整頁截圖，1407px 原圖
 * × 1.0235 換算回 1440 畫布）：
 * - 青底帶（brand-soft）y3052→3812；黑卡 y3133→3812（上緣距色帶 81、
 *   底緣平角貼齊 footer 青色帶，無下圓角）
 * - 白字跑馬燈 "Witness story"：foam 色，字級沿用 dive-sites 同法換算
 *   （xl ≈ 193px），垂直中心 = 卡片垂直中心（y3472，兩者實測重合），
 *   卡片與箭頭疊於跑馬燈之上
 * - 卡片內容（首屏）：日期 → 標題白 chip → 描述白 chip，置中直排；
 *   VIEW POST pill：brand-soft 底 + ink 字，約 146x44、距卡底約 80
 * - Pad/Mobile 無獨立設計稿：卡片 420x600 / 256x456 同比縮，屬記錄假設；
 *   跑馬燈 top 值 = 卡片上緣 padding + 卡高一半（對齊卡片中心）
 *
 * S3.4 內容改串 API activities（Figma spec：由上到下 date → title →
 * description → post_link；後端為 null 的欄位整節點不渲染）。
 */
const MARQUEE_DURATION_SECONDS = 15;

/** 卡片頭像列：白圓 + 四角取景框 mark（同 navbar logo）+ 灰字。 */
function StoryHeader() {
  return (
    <div className="mt-3 flex items-center gap-2.5 px-4 md:mt-4 md:px-5 xl:mt-5 xl:gap-3">
      <span className="flex size-7 items-center justify-center rounded-full bg-surface-card text-ink md:size-8 xl:size-10">
        <Scan
          className="size-4 xl:size-5"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </span>
      <span className="text-sm text-ink-soft xl:text-base">
        {WITNESS_HEADER_LABEL}
      </span>
    </div>
  );
}

/**
 * S3.4 卡片內容（API 資料）：date → title → description 置中直排。
 * description 為 null 時整個 <p> 不渲染（Figma spec「null 不做顯示」）。
 */
function StoryContent({ activity }: { readonly activity: Activity }) {
  const chipClass =
    "bg-surface-card px-3 py-1 text-center text-sm font-semibold text-ink md:px-4 md:py-1.5 md:text-lg xl:px-5 xl:py-2 xl:text-2xl";
  return (
    <div className="flex flex-col items-center gap-3 px-4 pt-8 md:gap-4 md:px-5 md:pt-12 xl:gap-5 xl:pt-16">
      <p className="font-display text-lg font-semibold text-foam md:text-2xl xl:mb-4 xl:text-[28px]">
        {formatActivityDate(activity.date)}
      </p>
      <p className={chipClass}>{activity.title}</p>
      {activity.description !== null ? (
        <p className={`${chipClass} line-clamp-4 md:line-clamp-5`}>
          {activity.description}
        </p>
      ) : null}
    </div>
  );
}

/** VIEW POST 連結：新分頁開啟 post_link（安全性由呼叫端 isSafeHttpUrl 把關）。 */
function ViewPostAction({ href }: { readonly href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full bg-brand-soft px-5 py-2 font-display text-xs font-semibold tracking-[0.2em] text-ink transition-opacity hover:opacity-85 xl:px-7 xl:py-3 xl:text-sm"
    >
      {WITNESS_ACTION_LABEL}
    </a>
  );
}

/**
 * post_link 為 null 或非 http/https（javascript: 等危險協定、壞字串）
 * 時回傳 null → StoryViewer 連動作列容器一併不渲染（不留空殼 DOM）。
 */
function renderViewPost(activity: Activity) {
  const link = activity.post_link;
  if (link === null || !isSafeHttpUrl(link)) return null;
  return <ViewPostAction href={link} />;
}

/** loading / error / empty 三態共用的黑卡佔位（尺寸同 story 卡）。 */
function StoryStatusCard({ message }: { readonly message: string }) {
  return (
    <div
      role="status"
      className="flex h-[456px] w-[256px] items-center justify-center rounded-t-3xl bg-ink px-8 text-center text-sm text-foam md:h-[600px] md:w-[420px] md:text-base xl:h-[680px] xl:w-[558px] xl:rounded-t-[32px]"
    >
      {message}
    </div>
  );
}

/** 依 SWR 三態決定佔位文案；有資料時回傳 null（渲染 viewer）。 */
function resolveStatusMessage(
  count: number,
  isLoading: boolean,
  error: unknown,
): string | null {
  if (count > 0) return null;
  if (isLoading) return "目擊動態載入中……";
  if (error !== undefined) return "目擊動態載入失敗，請稍後再試。";
  return "目前沒有目擊動態。";
}

type WitnessStoryProps = {
  /** getStaticProps 預取資料（SWR fallbackData，首屏無 loading）。 */
  readonly fallbackActivities: readonly Activity[];
};

/**
 * Witness story 段落：白字跑馬燈置於卡片中心高度，story viewer 疊於其上。
 * 跑馬燈 top = 卡片上緣 padding + 卡高/2（base 64+228 / md 80+300 / xl 81+340）。
 * S3.4：卡片內容串 useActivities（SWR + ISR fallback），dots 數量 = 資料筆數。
 */
export function WitnessStory({ fallbackActivities }: WitnessStoryProps) {
  const { activities, error, isLoading } = useActivities(fallbackActivities);
  const statusMessage = resolveStatusMessage(
    activities.length,
    isLoading,
    error,
  );

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-[292px] -translate-y-1/2 md:top-[380px] xl:top-[421px]">
        <Marquee
          durationSeconds={MARQUEE_DURATION_SECONDS}
          className="w-full font-display text-[106px] font-semibold leading-none text-foam md:text-[144px] xl:text-[193px]"
        >
          {WITNESS_MARQUEE_WORDS.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="whitespace-nowrap pr-11 md:pr-15 xl:pr-20"
            >
              {word}
            </span>
          ))}
        </Marquee>
      </div>
      <div className="relative flex justify-center pt-16 md:pt-20 xl:pt-[81px]">
        {statusMessage === null ? (
          <StoryViewer
            items={activities}
            renderItem={(activity) => <StoryContent activity={activity} />}
            header={<StoryHeader />}
            renderAction={renderViewPost}
            label={WITNESS_HEADER_LABEL}
          />
        ) : (
          <StoryStatusCard message={statusMessage} />
        )}
      </div>
    </div>
  );
}
