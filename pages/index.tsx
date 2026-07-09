import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { useCallback, useState } from "react";

import { FullscreenMenu } from "@/components/fullscreen-menu";
import { Section, SectionContainer } from "@/components/layout/section";
import { Navbar } from "@/components/navbar";
import { HeroInformation } from "@/components/sections/hero";
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
      <Section id="photo-carousel" background="surface-mist" padding="spacious">
        <SectionPlaceholder label="Photo Carousel" />
      </Section>
      <Section id="favorite-dive-site" background="ink" padding="spacious">
        <SectionPlaceholder label="Favorite Dive Site" tone="light" />
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
      <Section as="footer" id="footer" background="brand" padding="default">
        <SectionPlaceholder label="Footer" />
      </Section>
    </div>
  );
}
