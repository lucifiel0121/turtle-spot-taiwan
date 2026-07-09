import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  /**
   * 跑馬燈字串清單。內容會被渲染兩份以達成 -50% 無縫循環，
   * 因此 words × repeat 的總寬需 >= 容器寬（不足時由呼叫端調 repeat），
   * 詞間距內建於每個 span 的尾端 padding，確保接縫處間距一致。
   */
  readonly words: ReadonlyArray<string>;
  /** words 重複次數（湊滿容器寬用），預設 1。 */
  readonly repeat?: number;
  /**
   * 速度採「一輪循環秒數」（位移一份內容寬所需時間）而非每秒 px：
   * 純 CSS 即可實作、不需 JS 量測內容寬，代價是內容越長視覺速度越快，
   * 由各 section 呼叫端依內容長度調整。
   */
  readonly durationSeconds?: number;
  /** 捲動方向，預設向左。 */
  readonly direction?: "left" | "right";
  /** 透傳給外層容器，供各 section 控制字級／顏色。 */
  readonly className?: string;
};

/** 三個大字 section（hero / dive-sites / witness）實測皆用 15s 一輪。 */
const DEFAULT_DURATION_SECONDS = 15;

/** 詞間距（Figma 量測：Desktop 80px、Pad/Mobile 同比縮小）。 */
const WORD_CLASS = "whitespace-nowrap pr-8 md:pr-11 xl:pr-20";

/**
 * S2.3 共用跑馬燈：水平無限捲動（hero Information / Favorite Dive Site /
 * Witness story 三處大字共用）。
 * - transform-only 動畫（不觸發 layout），keyframes 定義於 styles/globals.css
 * - 第二份內容 aria-hidden，螢幕閱讀器只讀一次
 * - prefers-reduced-motion: reduce 時停止動畫（WCAG 2.2.2）
 */
export function Marquee({
  words,
  repeat = 1,
  durationSeconds = DEFAULT_DURATION_SECONDS,
  direction = "left",
  className,
}: MarqueeProps) {
  const trackStyle = {
    "--marquee-duration": `${durationSeconds}s`,
    animationDirection: direction === "right" ? "reverse" : "normal",
  } as CSSProperties;

  const sequence = Array.from({ length: repeat }, () => words).flat();
  const copy = sequence.map((word, index) => (
    <span key={`${word}-${index}`} className={WORD_CLASS}>
      {word}
    </span>
  ));

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="marquee-track flex w-max" style={trackStyle}>
        <div className="flex shrink-0">{copy}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {copy}
        </div>
      </div>
    </div>
  );
}
