/**
 * S2.6 Favorite Dive Site 文案（AD-5：文案集中常數檔）。
 * 逐字核對來源：Figma Desktop 1440 整頁截圖黑底區（2026-07-10 裁切放大）。
 */

export type DiveSiteVariant = "brand-soft" | "foam";

export type DiveSite = {
  /** pin 內上標小字 */
  readonly label: string;
  /** pin 內地名大字 */
  readonly name: string;
  /** pin 填色（對映 @theme token） */
  readonly variant: DiveSiteVariant;
};

/** 兩張 map-pin 卡：primary 置左上（青）、secondary 置右下（白）。 */
export const DIVE_SITE_CARDS = {
  primary: { label: "最愛潛點", name: "花瓶岩", variant: "brand-soft" },
  secondary: { label: "最愛潛點", name: "美人洞", variant: "foam" },
} as const satisfies Record<string, DiveSite>;

/** 跑馬燈大字（重複次數由呼叫端以 Marquee repeat prop 控制）。 */
export const DIVE_MARQUEE_TEXT = "Favorite Dive Site";
