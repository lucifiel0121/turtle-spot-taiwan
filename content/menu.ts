/**
 * S2.2 全螢幕選單文案（AD-5：文案集中常數檔）。
 * 逐字核對來源：Figma Desktop 1440 整頁截圖選單覆蓋層。
 */

export type MenuNavItem = {
  readonly zh: string;
  readonly en: string;
};

/** 導覽項：中文小字 + 英文大字（設計稿未給目的地 URL，href 由元件以 "#" 佔位）。 */
export const MENU_NAV_ITEMS: readonly MenuNavItem[] = [
  { zh: "海龜地圖", en: "Map" },
  { zh: "文章分享", en: "Article" },
  { zh: "關於我們", en: "About" },
  { zh: "教育資源", en: "Resources" },
  { zh: "目擊回報", en: "Report Sightings" },
] as const;

export const MENU_CONTACT_TITLE = "聯絡我們";

/**
 * 設計稿選單原文為 info@gmail.com，與 footer 的 tstservice@gmail.com 不一致；
 * 忠實保留兩處原文不擅改，疑義記錄見 docs/design-questions.md 第 16 項。
 */
export const MENU_CONTACT_EMAIL = "info@gmail.com";

export const MENU_FOLLOW_TITLE = "追蹤我們";

export const MENU_SOCIAL_LINKS = ["facebook", "instagram"] as const;
