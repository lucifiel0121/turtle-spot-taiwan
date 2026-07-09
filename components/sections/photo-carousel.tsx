import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Carousel,
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

function SlideImage({ slide }: { readonly slide: PhotoCarouselSlide }) {
  return (
    <Image
      src={slide.src}
      alt={slide.alt}
      width={720}
      height={540}
      sizes="(min-width: 1280px) 50vw, (min-width: 768px) 70vw, 79vw"
      className="aspect-[4/3] w-full rounded-lg object-cover"
    />
  );
}

/** S3.1 照片輪播：中央大圖 + 左右露出、黑圓箭頭與長條 dots 聯動、loop 循環。 */
export function PhotoCarousel() {
  return (
    <div className="rounded-b-4xl bg-surface-mist pt-10 pb-8 md:pt-16 md:pb-10 xl:pt-26 xl:pb-18">
      <Carousel opts={{ loop: true, align: "center" }}>
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
