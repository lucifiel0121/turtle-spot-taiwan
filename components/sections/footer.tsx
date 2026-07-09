import { FOOTER } from "@/content/footer";

/**
 * S2.7 Footer 量測（Figma Desktop 1440 整頁截圖，1407px 原圖 × 1.0235 換算
 * 回 1440 畫布）：
 * - 青色帶（--color-brand）y3812→4192、高 ≈380
 * - 大字 "Turtle Spot Taiwan"：左 83、距帶頂 60、字級 ≈42（Poppins semibold）
 * - "© 2021 Turtle Spot Taiwan"：左 83、距帶底 141、字級 ≈16
 * - contact 欄：左 880、距帶頂 113、行進 ≈36（字級 ≈18）
 * - sponsor 欄：左 1140、logo 寬 ≈118、右緣 1258（→ 右 padding 182）
 * - Pad/Mobile 無獨立設計稿：直排 title → contact → sponsor → ©，屬記錄中的假設
 */

type WalkingFigureProps = {
  readonly className?: string;
};

/** 走路人剪影（禮帽 + 前傾軀幹 + 跨步雙腿）：以簡易 SVG 近似截圖 logo 圖形。 */
function WalkingFigure({ className }: WalkingFigureProps) {
  return (
    <svg
      viewBox="0 0 22 34"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 0h5v3.4h-5z" />
      <path d="M12.3 3.8h7.4v1.6h-7.4z" />
      <circle cx="15.6" cy="8" r="2.3" />
      <path d="M14.2 10.6 10.6 17.8 13.8 18.9 16.9 11.6z" />
      <path d="M15.8 11.4 19.6 14.8 18.4 16.6 14.6 13.4z" />
      <path d="M11 17.6 3.4 25.4 5.2 27.4 12.6 19.8z" />
      <path d="M12.8 18.6 15.4 26.4 13.2 33.4 16.4 34 19 26 14.9 17.9z" />
      <path d="M2.2 26.2 5 28.6 3 30.2 0.6 27.8z" />
    </svg>
  );
}

/** THE KEEP WALKING FUND 夢想資助計畫：文字排版 + CSS 半框線重現截圖 logo。 */
function SponsorLogo() {
  const { the, main, fund, zh } = FOOTER.sponsor.logo;
  return (
    <div
      aria-label={`${the} ${main} ${fund} ${zh}`}
      className="w-[118px] font-display font-bold text-ink"
    >
      <div className="flex items-end gap-1">
        <span className="text-sm leading-none">{the}</span>
        <span className="relative mb-[2px] h-[7px] flex-1 border-r-[3px] border-t-[3px] border-ink">
          <WalkingFigure className="absolute -right-[6px] -top-[30px] h-[34px] w-[22px]" />
        </span>
      </div>
      <div className="mt-[2px] whitespace-nowrap border-[3px] border-ink py-[2px] text-center text-[13px] leading-none tracking-[-0.04em]">
        {main}
      </div>
      <div className="mt-[2px] flex items-start gap-1">
        <span className="h-[7px] flex-1 border-b-[3px] border-l-[3px] border-ink" />
        <span className="text-sm leading-none">{fund}</span>
      </div>
      <p className="mt-[6px] text-center text-[11px] font-medium leading-none tracking-[0.28em]">
        {zh}
      </p>
    </div>
  );
}

/** contact us 欄：email 走 mailto:，社群連結目前為佔位（見 content/footer.ts）。 */
function ContactColumn() {
  return (
    <div className="flex flex-col gap-[18px] text-lg font-medium leading-none text-ink">
      <p>{FOOTER.contact.label}</p>
      {FOOTER.contact.links.map((link) => (
        <a key={link.label} href={link.href} className="w-fit hover:underline">
          {link.label}
        </a>
      ))}
    </div>
  );
}

/** Footer：青底、大字標題左上、© 左下、contact + sponsor 兩欄靠右。 */
export function Footer() {
  return (
    <div className="relative flex flex-col gap-10 px-4 py-12 md:px-8 xl:h-[380px] xl:flex-row xl:justify-between xl:gap-0 xl:pb-0 xl:pl-[83px] xl:pr-[182px] xl:pt-[60px]">
      <p className="font-display text-[32px] font-semibold leading-none text-ink xl:text-[42px]">
        {FOOTER.title}
      </p>
      <div className="flex flex-col gap-10 md:flex-row md:gap-16 xl:gap-[71px] xl:pt-[53px]">
        <ContactColumn />
        <div className="flex flex-col gap-4">
          <p className="text-lg font-medium leading-none text-ink">
            {FOOTER.sponsor.label}
          </p>
          <SponsorLogo />
        </div>
      </div>
      <p className="text-base font-medium leading-none text-ink xl:absolute xl:bottom-[141px] xl:left-[83px]">
        {FOOTER.copyright}
      </p>
    </div>
  );
}
