import Image from "next/image";

import { Marquee } from "@/components/marquee";

/**
 * S2.4 Hero Information 量測（Figma Desktop 1440 整頁截圖，取樣座標為
 * 1407px 寬原圖 × 1.0235 換算回 1440 畫布）：
 * - 圓形海龜照：外徑 400px（含 foam 白框約 6px），水平置中，
 *   上緣距 navbar 下緣約 80px，下緣距下一段（資訊卡 tab）約 80px
 * - 跑馬燈大字 "Information"：顏色 #F5FCFF（--color-foam）、詞間隔約 80px、
 *   層級在圓照之下。原設計字體與 Poppins 字形比例不同（cap 146 / f 147 /
 *   x-height 101 / n 寬 98，皆 1440 換算值），無法同時吻合；取誤差總和最小的
 *   185px（f=144 吻合、x-height +3、cap -16），並以 translate-y 0.07em 將
 *   x-height 中線對齊設計（設計 x 中線在圓心下方約 26px）
 * - Desktop 截圖 Hero 區掃描無 sponsor logo（KEEP WALKING FUND 僅出現於
 *   footer），故此處不放；如 Figma 原稿 Hero 另有 logo 節點屬疑義，記錄不擅加
 * - 圓照海龜朝向：設計稿為 public/images/hero-turtle.jpeg 的水平鏡像
 *   （頭朝右），以 -scale-x-100 翻轉對齊設計
 * - S4.1 Pad/Mobile 設計稿校正（768/375 整頁縮圖，藍框內容換算回視寬）：
 *   圓徑 md 300 / base 220 與縮圖吻合維持；圓照上緣距 navbar 兩檔皆 ≈81px
 *   （pt-20）、Pad 下緣距資料卡 tab ≈86px（md:pb-20）；跑馬燈字級縮圖實測
 *   md ≈0.58×desktop、base ≈0.42×desktop（cap 高換算，blur ±10%，
 *   取 107/78px），詞間隔同比縮小
 */
const HERO_MARQUEE_WORD = "Information";

/** Hero Information：跑馬燈大字置底，圓形海龜照置中疊於其上。 */
export function HeroInformation() {
  return (
    <div className="relative flex flex-col items-center pb-10 pt-20 md:pb-20 xl:py-20">
      <div className="absolute inset-0 flex items-center">
        <Marquee
          words={[HERO_MARQUEE_WORD]}
          repeat={3}
          className="w-full translate-y-[0.07em] font-display text-[78px] font-semibold leading-none text-foam md:text-[107px] xl:text-[185px]"
        />
      </div>
      <Image
        src="/images/hero-turtle.jpeg"
        alt="綠蠵龜在珊瑚礁上方悠游"
        width={400}
        height={400}
        priority
        className="relative size-[220px] -scale-x-100 rounded-full border-4 border-foam object-cover object-center md:size-[300px] md:border-[5px] xl:size-[400px] xl:border-[6px]"
      />
    </div>
  );
}
