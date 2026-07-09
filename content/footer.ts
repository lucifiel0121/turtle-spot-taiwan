/**
 * S2.7 Footer 文案（AD-5：文案集中常數檔）。
 * 逐字核對來源：Figma Desktop 1440 整頁截圖 footer 區（2026-07-10 裁切放大）。
 */

export type FooterLink = {
  readonly label: string;
  readonly href: string;
};

export const FOOTER = {
  /** 左上大字：截圖確認為靜態標題（Spec 三處跑馬燈不含 footer） */
  title: "Turtle Spot Taiwan",
  copyright: "© 2021 Turtle Spot Taiwan",
  contact: {
    label: "contact us :",
    links: [
      { label: "tstservice@gmail.com", href: "mailto:tstservice@gmail.com" },
      // 設計稿只給 Facebook / Instagram 文字未給 URL，先以 "#" 佔位待補
      { label: "Facebook", href: "#" },
      { label: "Instagram", href: "#" },
    ],
  },
  sponsor: {
    label: "sponsor :",
    /** logo 文字組成，框線與走路人剪影由元件以 CSS border + 簡易 SVG 重現 */
    logo: {
      the: "THE",
      main: "KEEP WALKING",
      fund: "FUND",
      zh: "夢想資助計畫",
    },
  },
} as const;
