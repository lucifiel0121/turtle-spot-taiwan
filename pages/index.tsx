import type { GetStaticProps } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";

import { FullscreenMenu } from "@/components/fullscreen-menu";
import { Section } from "@/components/layout/section";
import { Navbar } from "@/components/navbar";
import { DiveSites } from "@/components/sections/dive-sites";
import { Footer } from "@/components/sections/footer";
import { HeroInformation } from "@/components/sections/hero";
import { PhotoCarousel } from "@/components/sections/photo-carousel";
import { TurtleProfile } from "@/components/sections/turtle-profile";
import { WitnessStory } from "@/components/sections/witness-story";
import { fetchActivities } from "@/lib/activities";
import type { Activity } from "@/types/activity";

type HomeProps = {
  readonly fallbackActivities: readonly Activity[];
};

const REVALIDATE_SECONDS = 3600;

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  try {
    const activities = await fetchActivities();
    return {
      props: { fallbackActivities: [...activities] },
      revalidate: REVALIDATE_SECONDS,
    };
  } catch (error) {
    // fetch 失敗不讓 build 掛掉，回傳空陣列由 client 端 SWR 重試
    console.warn("getStaticProps: fetchActivities failed", error);
    return {
      props: { fallbackActivities: [] },
      revalidate: REVALIDATE_SECONDS,
    };
  }
};

/**
 * S1.2 頁面骨架：六大 section 順序與背景色帶對齊 Figma Desktop 1440 整頁截圖。
 * Breakpoint 對映見 components/layout/section.tsx 檔頭註解。
 * S3.4：getStaticProps 預取的 activities 傳入 WitnessStory 作 SWR fallback，
 * 首屏直出 API 內容、client 端背景 revalidate。
 */
export default function Home({ fallbackActivities }: HomeProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col">
      <Head>
        <title>Turtle Spot Taiwan｜海龜目擊回報</title>
        <meta
          name="description"
          content="Turtle Spot Taiwan 海龜點點名：認識台灣海龜、探索熱門潛點，即時追蹤與回報海龜目擊動態。"
        />
      </Head>
      {/* header 疊在全螢幕選單（z-40）之上，選單開啟時 menu 鈕仍可點擊關閉 */}
      <Section
        as="header"
        id="navbar"
        background="brand-soft"
        className="relative z-50"
      >
        {/* Navbar 為滿版 bar（右側深色塊貼齊視窗右緣），不走 SectionContainer */}
        <Navbar onMenuClick={toggleMenu} menuOpen={menuOpen} />
      </Section>
      <FullscreenMenu open={menuOpen} onClose={closeMenu} />
      <Section id="hero-information" background="brand-soft">
        {/* S2.4 Hero：上下留白由 HeroInformation 依截圖量測自控（非 spacious 齊一值） */}
        <HeroInformation />
      </Section>
      <Section id="turtle-profile" background="brand-soft">
        {/* S2.5 資料卡屬 hero 青色帶；卡片下緣與 carousel 灰帶齊平（截圖量測無間隙） */}
        <TurtleProfile />
      </Section>
      <Section id="photo-carousel" background="ink">
        {/* S3.1 灰帶圓角容器由 PhotoCarousel 自帶（底部圓角 32），section 背景 ink 供圓角缺口透出 */}
        <PhotoCarousel />
      </Section>
      <Section id="favorite-dive-site" background="brand-soft">
        {/* S2.6 黑底由 DiveSites 自帶（含底部圓角 24），section 背景青色供圓角缺口透出 */}
        <DiveSites />
      </Section>
      <Section id="witness-story" background="brand-soft">
        {/* S3.3 卡片底緣平角貼齊 footer 色帶（截圖量測無間隙），上緣留白由 WitnessStory 自控 */}
        <WitnessStory fallbackActivities={fallbackActivities} />
      </Section>
      <Section as="footer" id="footer" background="brand">
        {/* S2.7 Footer：內距由 Footer 依截圖量測自控（大字/©/contact/sponsor 定位） */}
        <Footer />
      </Section>
    </div>
  );
}
