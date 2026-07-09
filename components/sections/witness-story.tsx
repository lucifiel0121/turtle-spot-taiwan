import { Scan } from "lucide-react";

import { Marquee } from "@/components/marquee";
import { StoryViewer } from "@/components/story-viewer";
import {
  WITNESS_ACTION_LABEL,
  WITNESS_HEADER_LABEL,
  WITNESS_MARQUEE_WORDS,
  WITNESS_PLACEHOLDER_ACTIVITIES,
} from "@/content/witness-story";
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

/** S3.3 佔位內容：日期 + 標題/描述白 chip；S3.4 串 API 後維持同一結構。 */
function StoryContent({ activity }: { readonly activity: Activity }) {
  const chipClass =
    "bg-surface-card px-3 py-1 text-sm font-semibold text-ink md:px-4 md:py-1.5 md:text-lg xl:px-5 xl:py-2 xl:text-2xl";
  return (
    <div className="flex flex-col items-center gap-3 pt-8 md:gap-4 md:pt-12 xl:gap-5 xl:pt-16">
      <p className="font-display text-lg font-semibold text-foam md:text-2xl xl:mb-4 xl:text-[28px]">
        {activity.date.replaceAll("-", "/")}
      </p>
      <p className={chipClass}>{activity.title}</p>
      {activity.description ? (
        <p className={chipClass}>{activity.description}</p>
      ) : null}
    </div>
  );
}

/** VIEW POST：S3.3 先渲染樣式（假資料 post_link 為 null），S3.4 接連結。 */
function ViewPostAction() {
  return (
    <span className="rounded-full bg-brand-soft px-5 py-2 font-display text-xs font-semibold tracking-[0.2em] text-ink xl:px-7 xl:py-3 xl:text-sm">
      {WITNESS_ACTION_LABEL}
    </span>
  );
}

/**
 * Witness story 段落：白字跑馬燈置於卡片中心高度，story viewer 疊於其上。
 * 跑馬燈 top = 卡片上緣 padding + 卡高/2（base 64+228 / md 80+300 / xl 81+340）。
 */
export function WitnessStory() {
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
        <StoryViewer
          items={WITNESS_PLACEHOLDER_ACTIVITIES}
          renderItem={(activity) => <StoryContent activity={activity} />}
          header={<StoryHeader />}
          renderAction={() => <ViewPostAction />}
          label={WITNESS_HEADER_LABEL}
        />
      </div>
    </div>
  );
}
