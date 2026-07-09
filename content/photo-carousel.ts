export type PhotoCarouselSlide = {
  readonly src: string;
  readonly alt: string;
};

/**
 * S3.1 照片輪播 slides：設計稿為 6 顆 dots（6 張照片），
 * 目前素材僅 3 張海龜照，故輪替兩輪湊滿 6 張讓 loop 有意義。
 */
export const PHOTO_CAROUSEL_SLIDES: readonly PhotoCarouselSlide[] = [
  { src: "/images/hero-turtle.jpeg", alt: "海龜在珊瑚礁上方游動的俯視照" },
  { src: "/images/turtle-face-right.jpeg", alt: "海龜面向右側的近拍照" },
  { src: "/images/turtle-face-left.jpeg", alt: "海龜面向左側的近拍照" },
  { src: "/images/hero-turtle.jpeg", alt: "海龜在珊瑚礁上方游動的俯視照" },
  { src: "/images/turtle-face-right.jpeg", alt: "海龜面向右側的近拍照" },
  { src: "/images/turtle-face-left.jpeg", alt: "海龜面向左側的近拍照" },
];
