/**
 * Witness story 文案常數（AD-5：文案集中常數檔）。
 * 跑馬燈字樣逐字核對：Figma Desktop 1440 整頁截圖（2026-07-10 裁切放大）。
 * S3.3 的佔位假資料已於 S3.4 改串 API（lib/activities.ts）後移除。
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
