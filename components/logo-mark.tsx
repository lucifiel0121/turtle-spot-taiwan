import { Scan } from "lucide-react";

/**
 * 四角取景框 logo mark（navbar logo 與 witness story 卡頭像共用）。
 * lucide `Scan` 為原設計 mark 的最接近替代（S2.1 疑義紀錄）。
 */
export function LogoMark({ className }: { readonly className?: string }) {
  return <Scan className={className} strokeWidth={2.5} aria-hidden="true" />;
}
