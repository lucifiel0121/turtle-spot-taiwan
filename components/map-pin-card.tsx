import type { DiveSiteVariant } from "@/content/dive-sites";
import { cn } from "@/lib/utils";

/**
 * S2.6 map-pin 卡量測（Figma Desktop 1440 整頁截圖裁切放大）：
 * - pin 本體 282x322：一體成形水滴（非圓+硬三角）——圓徑 282 的圓身
 *   由左右 40 度切點以二次曲線平滑收至底部尖點，以 SVG path 重現
 * - 底部「陰影」為與 pin 同色的實心橢圓 118x38，距尖端 30
 *   （皆以相對 pin 寬的百分比實作，隨卡寬縮放）
 * - 文字皆 --color-ink：上標小字 15px、地名 40px bold，
 *   文字疊中線比圓心高約 8px（以 pb 6% 重現）
 */
const PIN_VIEWBOX = "0 0 282 322";
const PIN_PATH =
  "M33 232A141 141 0 1 1 249 232Q200 300 141 322Q82 300 33 232Z";

const VARIANT_FILL: Record<DiveSiteVariant, string> = {
  "brand-soft": "text-brand-soft",
  foam: "text-foam",
};

type MapPinCardProps = {
  readonly variant: DiveSiteVariant;
  readonly label: string;
  readonly name: string;
  /** 由呼叫端控制卡寬與定位；文字字級以卡寬 base 180 / md 212 / xl 282 同比設定 */
  readonly className?: string;
};

/** 最愛潛點 map-pin 卡：水滴形 pin + 同色橢圓陰影，文字置於圓形區內。 */
export function MapPinCard({
  variant,
  label,
  name,
  className,
}: MapPinCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center",
        VARIANT_FILL[variant],
        className,
      )}
    >
      <div className="relative w-full">
        <svg
          viewBox={PIN_VIEWBOX}
          className="block w-full"
          aria-hidden="true"
          focusable="false"
        >
          <path d={PIN_PATH} fill="currentColor" />
        </svg>
        {/* 圓形區 = pin 上段正方形（寬 282 中圓徑 282） */}
        <div className="absolute inset-x-0 top-0 flex aspect-square flex-col items-center justify-center gap-3 pb-[6%] text-ink md:gap-3.5 xl:gap-5">
          <p className="text-[10px] font-medium leading-none md:text-[11px] xl:text-[15px]">
            {label}
          </p>
          <p className="text-[26px] font-bold leading-none md:text-[30px] xl:text-[40px]">
            {name}
          </p>
        </div>
      </div>
      {/* rounded-[50%] 而非 rounded-full：後者為藥丸形，設計為真橢圓 */}
      <div className="mt-[10.6%] aspect-[118/38] w-[41.8%] rounded-[50%] bg-current" />
    </div>
  );
}
