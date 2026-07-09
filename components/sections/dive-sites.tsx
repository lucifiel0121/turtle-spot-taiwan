import { MapPinCard } from "@/components/map-pin-card";
import { Marquee } from "@/components/marquee";
import { DIVE_MARQUEE_TEXT, DIVE_SITE_CARDS } from "@/content/dive-sites";

/**
 * S2.6 Favorite Dive Site 量測（Figma Desktop 1440 整頁截圖，1407px 原圖
 * × 1.0235 換算回 1440 畫布）：
 * - 黑底帶（--color-ink）y2214→3052、高 838；底部圓角 24 露出下一段青色
 *   （上緣為上一段灰帶的圓角，非本段職責）
 * - 灰字跑馬燈 "Favorite Dive Site"：--color-ink-soft（取樣 #50535E 與 token
 *   一致），cap 高 ≈150（於無 pin 的 x 切片量測，避免 pin 反鋸齒邊緣污染）
 *   → 依 hero 同法（Poppins f=144@185px）換算字級 ≈193px，
 *   垂直中線在區塊 ≈48%；pin 疊於跑馬燈之上（大字穿過 pin 後方）
 * - 青 pin（花瓶岩）：左 163/1440=11.3%、上 97/838=11.6%、寬 282
 * - 白 pin（美人洞）：左 913/1440=63.4%、上 366/838=43.7%、寬 282
 * - S4.1 Pad/Mobile 設計稿校正（768/375 整頁縮圖）：Pad 區塊高 ≈756px、
 *   pin 寬 ≈212 維持、錯落位置與縮圖吻合；Mobile 直排置中與縮圖吻合；
 *   跑馬燈字級縮圖實測 md ≈0.58×desktop、base ≈0.42×desktop
 *   （blur ±10%，取 112/81px）
 */
/** Favorite Dive Site：黑底 + 灰字跑馬燈置中，兩張 map-pin 卡錯落疊於其上。 */
export function DiveSites() {
  return (
    <div className="relative overflow-hidden rounded-b-[24px] bg-ink">
      <div className="absolute inset-x-0 top-[48%] -translate-y-1/2">
        <Marquee
          words={[DIVE_MARQUEE_TEXT]}
          repeat={2}
          className="w-full font-display text-[81px] font-semibold leading-none text-ink-soft md:text-[112px] xl:text-[193px]"
        />
      </div>
      <div className="relative flex flex-col items-center gap-14 py-20 md:block md:h-[756px] md:py-0 xl:h-[838px]">
        <MapPinCard
          {...DIVE_SITE_CARDS.primary}
          className="w-[180px] md:absolute md:left-[11.3%] md:top-[11.6%] md:w-[212px] xl:w-[282px]"
        />
        <MapPinCard
          {...DIVE_SITE_CARDS.secondary}
          className="w-[180px] md:absolute md:left-[63.4%] md:top-[43.7%] md:w-[212px] xl:w-[282px]"
        />
      </div>
    </div>
  );
}
