import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import {
  PHOTO_CAROUSEL_SLIDES,
  type PhotoCarouselSlide,
} from "@/content/photo-carousel";
import { cn } from "@/lib/utils";

/**
 * S3.1 照片輪播量測（Figma Desktop 1440 整頁截圖，1407px 原圖 × 1.0235 換算）：
 * - 灰帶（surface-mist）滿版、上緣平角、下緣圓角約 32px（黑色 dive-site 區
 *   自 section 背景透出）；上 padding 約 104px、下約 72px
 * - 中央大圖 720x540（50% 視窗寬、4:3），左右各露出鄰圖約 135px，
 *   圖與圖間距約 224px（半間距 112px ≈ 7.8% 視窗寬）
 * - 黑圓箭頭直徑約 56px、白色 chevron；Desktop 置於間距中點
 *   （中心距視窗左/右緣約 17.2% 寬）、垂直對齊大圖中心
 * - dots：白色 8px 圓點、間距 12px；當前頁為黑色 24x8 長條
 * - Pad/Mobile 無獨立設計稿：箭頭與 dots 移至圖下方並排（使用者截圖證實），
 *   slide 佔比放大屬假設；autoplay 與 scale/opacity tween 為 S3.2 範圍
 */

/** autoplay 換頁間隔。 */
const AUTOPLAY_DELAY_MS = 4000;
/** 互動暫停後，閒置多久恢復自動播放（plan 決議 5-8 秒取中間值）。 */
const AUTOPLAY_RESUME_IDLE_MS = 6000;
/** tween：距中心一個 snap 時的縮小幅度（鄰圖 scale = 1 - 0.12 = 0.88）。 */
const TWEEN_SCALE_RANGE = 0.12;
/** tween：距中心一個 snap 時的淡出幅度（鄰圖 opacity = 1 - 0.45 = 0.55）。 */
const TWEEN_OPACITY_RANGE = 0.45;

const SLIDE_CLASS =
  "basis-[84%] px-[2.5%] md:basis-[76%] md:px-[3%] xl:basis-[65.6%] xl:px-[7.8%]";

const ARROW_CLASS =
  "border-0 bg-ink text-foam hover:bg-ink/85 hover:text-foam [&_svg:not([class*='size-'])]:size-6";

function CarouselDots({ className }: { readonly className?: string }) {
  const { api } = useCarousel();
  const [snapCount, setSnapCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSnapCount(api.scrollSnapList().length);
      setSelectedIndex(api.selectedScrollSnap());
    };
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Array.from({ length: snapCount }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`切換至第 ${index + 1} 張照片`}
          aria-current={index === selectedIndex}
          onClick={() => api?.scrollTo(index)}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === selectedIndex ? "w-6 bg-ink" : "w-2 bg-surface-card",
          )}
        />
      ))}
    </div>
  );
}

/**
 * S3.2 autoplay 語意（plan 已定）：
 * - 載入即自動輪播；prefers-reduced-motion: reduce 時不啟動（WCAG 2.2.2，
 *   與 marquee 慣例一致）
 * - 任何互動（箭頭 / dot / 拖曳 / 鍵盤）立即暫停
 * - 閒置 AUTOPLAY_RESUME_IDLE_MS 後恢復自動播放
 * - 依 node_modules embla-carousel-autoplay@8.6.0 的 .d.ts 核對：內建選項為
 *   delay / jump / playOnInit / stopOnFocusIn / stopOnInteraction /
 *   stopOnMouseEnter / stopOnLastSnap / rootNode（v9 docs 的
 *   defaultInteraction / pause() 在 8.6.0 不存在）。內建選項只能感知
 *   拖曳與 focus、看不到箭頭與 dot 點擊，故採 playOnInit: false +
 *   plugin API（stop()/play()）+ 自訂 idle timer 實作暫停/恢復語意。
 */
function CarouselAutoplayController() {
  const { api } = useCarousel();

  useEffect(() => {
    const autoplay = api?.plugins().autoplay;
    const region = api?.rootNode().closest("[data-slot='carousel']");
    if (!api || !autoplay || !region) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let idleTimerId = 0;
    const pauseThenResumeWhenIdle = () => {
      autoplay.stop();
      window.clearTimeout(idleTimerId);
      idleTimerId = window.setTimeout(
        () => autoplay.play(),
        AUTOPLAY_RESUME_IDLE_MS,
      );
    };

    autoplay.play();
    region.addEventListener("pointerdown", pauseThenResumeWhenIdle, true);
    region.addEventListener("keydown", pauseThenResumeWhenIdle, true);
    return () => {
      window.clearTimeout(idleTimerId);
      region.removeEventListener("pointerdown", pauseThenResumeWhenIdle, true);
      region.removeEventListener("keydown", pauseThenResumeWhenIdle, true);
    };
  }, [api]);

  return null;
}

type EmblaEngine = ReturnType<NonNullable<CarouselApi>["internalEngine"]>;

function clampUnit(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/** loop 模式下修正跨越接縫 slide 的進度差（Embla 官方 Scale/Opacity 範例 pattern）。 */
function tweenDiffToSnap(
  engine: EmblaEngine,
  scrollSnap: number,
  scrollProgress: number,
  slideIndex: number,
): number {
  let diff = scrollSnap - scrollProgress;
  if (!engine.options.loop) return diff;
  for (const loopItem of engine.slideLooper.loopPoints) {
    const target = loopItem.target();
    if (slideIndex !== loopItem.index || target === 0) continue;
    diff =
      target < 0
        ? scrollSnap - (1 + scrollProgress)
        : scrollSnap + (1 - scrollProgress);
  }
  return diff;
}

function applyTween(
  api: NonNullable<CarouselApi>,
  tweenNodes: readonly (HTMLElement | null)[],
) {
  const engine = api.internalEngine();
  const scrollProgress = api.scrollProgress();
  const snapList = api.scrollSnapList();
  snapList.forEach((scrollSnap, snapIndex) => {
    for (const slideIndex of engine.slideRegistry[snapIndex]) {
      const node = tweenNodes[slideIndex];
      if (!node) continue;
      const diff = tweenDiffToSnap(engine, scrollSnap, scrollProgress, slideIndex);
      const distance = clampUnit(Math.abs(diff) * snapList.length);
      node.style.transform = `scale(${1 - TWEEN_SCALE_RANGE * distance})`;
      node.style.opacity = String(1 - TWEEN_OPACITY_RANGE * distance);
    }
  });
}

/**
 * S3.2 tween：當前 slide scale 1 / opacity 1，距中心越遠越縮小淡出
 * （transform + opacity only，不觸發 layout）。scale 作用在 slide 內層
 * [data-tween-slide]，避免縮到 CarouselItem 的 padding。
 */
function CarouselTween() {
  const { api } = useCarousel();

  useEffect(() => {
    if (!api) return;
    let tweenNodes: (HTMLElement | null)[] = [];
    const setNodes = () => {
      tweenNodes = api
        .slideNodes()
        .map((slide) => slide.querySelector<HTMLElement>("[data-tween-slide]"));
    };
    const tween = () => applyTween(api, tweenNodes);
    const reInit = () => {
      setNodes();
      tween();
    };
    reInit();
    api.on("reInit", reInit).on("scroll", tween).on("slideFocus", tween);
    return () => {
      api.off("reInit", reInit).off("scroll", tween).off("slideFocus", tween);
    };
  }, [api]);

  return null;
}

function SlideImage({ slide }: { readonly slide: PhotoCarouselSlide }) {
  return (
    <div data-tween-slide>
      <Image
        src={slide.src}
        alt={slide.alt}
        width={720}
        height={540}
        sizes="(min-width: 1280px) 50vw, (min-width: 768px) 70vw, 79vw"
        className="aspect-[4/3] w-full rounded-lg object-cover"
      />
    </div>
  );
}

/**
 * S3.1 照片輪播：中央大圖 + 左右露出、黑圓箭頭與長條 dots 聯動、loop 循環。
 * S3.2 加入 autoplay（互動暫停、閒置恢復）與 scale/opacity tween。
 */
export function PhotoCarousel() {
  const autoplayPlugin = useRef(
    Autoplay({ delay: AUTOPLAY_DELAY_MS, playOnInit: false }),
  );

  return (
    <div className="rounded-b-4xl bg-surface-mist pt-10 pb-8 md:pt-16 md:pb-10 xl:pt-26 xl:pb-18">
      <Carousel
        opts={{ loop: true, align: "center" }}
        plugins={[autoplayPlugin.current]}
      >
        <CarouselAutoplayController />
        <CarouselTween />
        <div className="relative">
          <CarouselContent className="ml-0">
            {PHOTO_CAROUSEL_SLIDES.map((slide, index) => (
              <CarouselItem
                key={`${slide.src}-${index}`}
                className={SLIDE_CLASS}
              >
                <SlideImage slide={slide} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            className={cn(
              ARROW_CLASS,
              "left-[17.2%] hidden size-14 -translate-x-1/2 xl:inline-flex",
            )}
          />
          <CarouselNext
            className={cn(
              ARROW_CLASS,
              "right-[17.2%] hidden size-14 translate-x-1/2 xl:inline-flex",
            )}
          />
        </div>
        <div className="mt-5 flex items-center justify-center gap-6 md:mt-6 xl:mt-8">
          <CarouselPrevious
            className={cn(ARROW_CLASS, "static my-0 size-12 xl:hidden")}
          />
          <CarouselDots />
          <CarouselNext
            className={cn(ARROW_CLASS, "static my-0 size-12 xl:hidden")}
          />
        </div>
      </Carousel>
    </div>
  );
}
