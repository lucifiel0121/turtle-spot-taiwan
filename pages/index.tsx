import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { useCallback, useState } from "react";

import { FullscreenMenu } from "@/components/fullscreen-menu";
import { Section, SectionContainer } from "@/components/layout/section";
import { Navbar } from "@/components/navbar";
import { DiveSites } from "@/components/sections/dive-sites";
import { Footer } from "@/components/sections/footer";
import { HeroInformation } from "@/components/sections/hero";
import { PhotoCarousel } from "@/components/sections/photo-carousel";
import { TurtleProfile } from "@/components/sections/turtle-profile";
import { fetchActivities, useActivities } from "@/lib/activities";
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

type PlaceholderProps = {
  readonly label: string;
  readonly tone?: "dark" | "light";
};

/** S1.2 佔位：各 section 先放名稱文字，內容於 S2.x/S3.x 實作。 */
function SectionPlaceholder({ label, tone = "dark" }: PlaceholderProps) {
  return (
    <SectionContainer>
      <p
        className={
          tone === "light"
            ? "font-display text-2xl font-semibold text-foam md:text-3xl xl:text-4xl"
            : "font-display text-2xl font-semibold text-ink md:text-3xl xl:text-4xl"
        }
      >
        {label}
      </p>
    </SectionContainer>
  );
}

/**
 * S1.2 頁面骨架：六大 section 順序與背景色帶對齊 Figma Desktop 1440 整頁截圖。
 * Breakpoint 對映見 components/layout/section.tsx 的 BREAKPOINT_MAP。
 */
export default function Home({
  fallbackActivities,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { activities, error } = useActivities(fallbackActivities);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* header 疊在全螢幕選單（z-40）之上，選單開啟時 menu 鈕仍可點擊關閉 */}
      <Section
        as="header"
        id="navbar"
        background="brand-soft"
        padding="none"
        className="relative z-50"
      >
        {/* Navbar 為滿版 bar（右側深色塊貼齊視窗右緣），不走 SectionContainer */}
        <Navbar onMenuClick={toggleMenu} menuOpen={menuOpen} />
      </Section>
      <FullscreenMenu open={menuOpen} onClose={closeMenu} />
      <Section id="hero-information" background="brand-soft" padding="none">
        {/* S2.4 Hero：上下留白由 HeroInformation 依截圖量測自控（非 spacious 齊一值） */}
        <HeroInformation />
      </Section>
      <Section id="turtle-profile" background="brand-soft" padding="none">
        {/* S2.5 資料卡屬 hero 青色帶；卡片下緣與 carousel 灰帶齊平（截圖量測無間隙） */}
        <TurtleProfile />
      </Section>
      <Section id="photo-carousel" background="ink" padding="none">
        {/* S3.1 灰帶圓角容器由 PhotoCarousel 自帶（底部圓角 32），section 背景 ink 供圓角缺口透出 */}
        <PhotoCarousel />
      </Section>
      <Section id="favorite-dive-site" background="brand-soft" padding="none">
        {/* S2.6 黑底由 DiveSites 自帶（含底部圓角 24），section 背景青色供圓角缺口透出 */}
        <DiveSites />
      </Section>
      <Section id="witness-story" background="brand-soft" padding="spacious">
        <SectionPlaceholder label="Witness Story" />
        <SectionContainer className="mt-6 text-sm text-ink">
          {/* S1.1 資料流佔位清單，S3.x 改為目擊動態卡片 */}
          <h2 className="font-medium">Activities（{activities.length} 筆）</h2>
          {error ? <p>活動資料載入失敗</p> : null}
          <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
            {activities.map((activity) => (
              <li key={`${activity.title}-${activity.date}`}>
                {activity.date} — {activity.title}
              </li>
            ))}
          </ul>
        </SectionContainer>
      </Section>
      <Section as="footer" id="footer" background="brand" padding="none">
        {/* S2.7 Footer：內距由 Footer 依截圖量測自控（大字/©/contact/sponsor 定位） */}
        <Footer />
      </Section>
    </div>
  );
}
