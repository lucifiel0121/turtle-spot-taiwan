import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { useCallback, useState } from "react";

import { FullscreenMenu } from "@/components/fullscreen-menu";
import { Section, SectionContainer } from "@/components/layout/section";
import { Marquee } from "@/components/marquee";
import { Navbar } from "@/components/navbar";
import { fetchActivities, useActivities } from "@/lib/activities";
import type { Activity } from "@/types/activity";

type HomeProps = {
  readonly fallbackActivities: readonly Activity[];
};

const REVALIDATE_SECONDS = 3600;

// S2.3 demo：單份內容重複三次確保寬度 >= 容器寬（Marquee 無縫循環前提）
const HERO_MARQUEE_WORDS = ["Information", "Information", "Information"] as const;

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
      <Section id="hero-information" background="brand-soft" padding="spacious">
        {/* S2.3 暫掛 demo：僅驗證 Marquee 捲動；完整 Hero 版面於 S2.4 實作 */}
        <Marquee
          durationSeconds={15}
          className="font-display text-6xl font-semibold text-foam md:text-8xl xl:text-9xl"
        >
          {HERO_MARQUEE_WORDS.map((word, index) => (
            <span key={`${word}-${index}`} className="whitespace-nowrap pr-10">
              {word}
            </span>
          ))}
        </Marquee>
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
