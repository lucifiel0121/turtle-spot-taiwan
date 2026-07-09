import type { Activity } from "@/types/activity";

/**
 * S3.3 Witness story 文案與假資料（AD-5：文案集中常數檔）。
 * 跑馬燈字樣逐字核對：Figma Desktop 1440 整頁截圖（2026-07-10 裁切放大）。
 */

/** 跑馬燈大字：渲染兩份達成內容寬 >= 容器寬（Marquee 呼叫端約定）。 */
export const WITNESS_MARQUEE_WORDS = [
  "Witness story",
  "Witness story",
] as const;

/** viewer 頭像列文字（設計稿卡片左上）。 */
export const WITNESS_HEADER_LABEL = "目擊動態";

/** 底部按鈕文字（設計稿卡片底部 pill）。 */
export const WITNESS_ACTION_LABEL = "VIEW POST";

/** 假資料筆數：對齊設計稿 dots 示意的 10 顆；S3.4 改由 API 資料筆數決定。 */
const PLACEHOLDER_COUNT = 10;

/**
 * S3.3 佔位資料：型別對齊 GraphQL Activity（S3.4 直接換 useActivities 結果）。
 * 首筆採設計稿文案（2018/05/14 最新目擊!!! 花瓶岩到美人洞），
 * 其餘為可辨識的示意內容，供換頁行為驗證時肉眼區分頁面。
 */
export const WITNESS_PLACEHOLDER_ACTIVITIES: readonly Activity[] = Array.from(
  { length: PLACEHOLDER_COUNT },
  (_, index): Activity =>
    index === 0
      ? {
          title: "最新目擊!!!",
          description: "花瓶岩到美人洞",
          post_link: null,
          date: "2018-05-14",
        }
      : {
          title: `目擊示意 ${index + 1}`,
          description: `潛點示意 ${index + 1}`,
          post_link: null,
          date: `2018-05-${String(14 - index).padStart(2, "0")}`,
        },
);
