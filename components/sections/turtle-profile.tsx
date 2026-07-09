import Image from "next/image";

import {
  TURTLE_PROFILE,
  type TurtleProfileField,
  type TurtleProfilePhoto,
} from "@/content/turtle-profile";

/**
 * S2.5 海龜資料卡量測（Figma Desktop 1440 整頁截圖，1407px 原圖 × 1.0235 換算）：
 * - 白色卡片（--color-surface-card）寬 920px 置中、四角直角（無圓角）、
 *   左右/下 padding 40px；卡片下緣與 carousel 灰帶（surface-mist）齊平無間隙
 * - tab：surface-mist 底、僅上緣兩角圓角約 16px、高 64px、px 40px、
 *   文字約 22px 粗體，名字與編號間距約 16px；tab 左緣貼齊卡片左緣
 * - 欄位列：Desktop/Pad 兩欄（欄寬相等、欄距 24px）、Mobile 一欄；
 *   文字 16px 粗體「label：value」（全形冒號），每列底部 1px 分隔線
 *   （--color-brand-soft），列距約 69px（上 32 / 文 24 / 下 12 / 線 1）
 * - 外型特徵列跨全寬；左臉/右臉照片列同兩欄格線，照片 409x262（約 25:16）
 *   直角滿欄寬，照片下方亦有分隔線
 * - S4.1 Pad/Mobile 設計稿校正（768/375 整頁縮圖）：tab 兩檔皆為滿卡寬
 *   灰 bar（含上圓角，非 Desktop 的 fit-content notch）、高 ≈53px；
 *   欄位 Pad 兩欄 / Mobile 一欄與縮圖吻合維持
 * - S4.2 側邊留白復測（同一組 768/375 縮圖，逐 row 子像素取樣校正）：
 *   Pad 卡片左右留白實測 ≈40px（margin/canvas 寬比 5.1%，非先前估的
 *   58px）→ md:px-10；Mobile 卡片左右留白實測為 0（card 邊緣與畫布邊緣
 *   同一像素轉場，無 teal 夾層）→ 全滿版、移除 px-4
 */

function ProfileFieldRow({ field }: { readonly field: TurtleProfileField }) {
  return (
    <p className="border-b border-brand-soft pb-2.5 pt-5 font-bold text-ink md:pb-3 md:pt-8">
      {field.label}：{field.value}
    </p>
  );
}

function ProfilePhotoCell({ photo }: { readonly photo: TurtleProfilePhoto }) {
  return (
    <figure className="border-b border-brand-soft pb-3 pt-5 md:pt-8">
      <figcaption className="font-bold text-ink">{photo.label}：</figcaption>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={818}
        height={524}
        sizes="(min-width: 768px) 409px, 92vw"
        className="mt-3 aspect-[25/16] w-full object-cover object-center"
      />
    </figure>
  );
}

/** S2.5 海龜資料卡：頂部 tab + 白色卡片（兩欄欄位、外型特徵、左右臉照片）。 */
export function TurtleProfile() {
  const { tab, fields, feature, photos } = TURTLE_PROFILE;
  return (
    <div className="px-0 md:px-10 xl:px-8">
      <div className="mx-auto flex w-full max-w-[920px] flex-col items-start">
        <div className="flex h-13 w-full items-center gap-3 rounded-t-2xl bg-surface-mist px-6 text-lg font-bold text-ink md:h-14 md:gap-4 md:px-10 md:text-[22px] xl:h-16 xl:w-auto">
          <span>{tab.name}</span>
          <span>{tab.id}</span>
        </div>
        <div className="w-full bg-surface-card px-5 pb-5 pt-1 md:px-10 md:pb-10 md:pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6">
            {fields.map((field) => (
              <ProfileFieldRow key={field.label} field={field} />
            ))}
            <div className="md:col-span-2">
              <ProfileFieldRow field={feature} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6">
            {photos.map((photo) => (
              <ProfilePhotoCell key={photo.label} photo={photo} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
