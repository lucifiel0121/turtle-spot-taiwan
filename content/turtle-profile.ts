/**
 * S2.5 海龜資料卡文案（AD-5：文案集中常數檔）。
 * 逐字核對來源：Figma Desktop 1440 整頁截圖資料卡區（2026-07-10 裁切放大）。
 */

export type TurtleProfileField = {
  readonly label: string;
  readonly value: string;
};

export type TurtleProfilePhoto = {
  readonly label: string;
  readonly src: string;
  readonly alt: string;
};

export const TURTLE_PROFILE = {
  /** 卡片頂部 tab：名字 + 個體編號 */
  tab: {
    name: "淡定哥",
    id: "#TW01H0064",
  },
  /** 兩欄欄位列（DOM 順序即 Desktop 兩欄 row-major / Mobile 單欄順序） */
  fields: [
    { label: "名字", value: "淡定哥" },
    { label: "品種", value: "綠蠵龜" },
    { label: "體型", value: "成年龜" },
    { label: "背甲花紋", value: "迷彩" },
    { label: "右臉鱗片", value: "眼下四片" },
    { label: "左臉鱗片", value: "眼下三片" },
    { label: "命名者", value: "Chun-Ting Jeffery Liu" },
    { label: "回報者", value: "陳坤田" },
  ],
  /** 跨全寬的外型特徵列 */
  feature: {
    label: "外型特徵",
    value: "背甲中間受傷，2017/03/24記錄到時已經有受傷了，目前看起來還沒好。",
  },
  /** 左右臉照片列 */
  photos: [
    {
      label: "左臉",
      src: "/images/turtle-face-left.jpeg",
      alt: "淡定哥左臉，眼下三片鱗片的綠蠵龜側面照",
    },
    {
      label: "右臉",
      src: "/images/turtle-face-right.jpeg",
      alt: "淡定哥右臉，眼下四片鱗片的綠蠵龜側面照",
    },
  ],
} as const satisfies {
  readonly tab: { readonly name: string; readonly id: string };
  readonly fields: readonly TurtleProfileField[];
  readonly feature: TurtleProfileField;
  readonly photos: readonly TurtleProfilePhoto[];
};
