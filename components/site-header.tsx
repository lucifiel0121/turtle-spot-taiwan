import { useCallback, useState } from "react";

import { FullscreenMenu } from "@/components/fullscreen-menu";
import { Section } from "@/components/layout/section";
import { Navbar } from "@/components/navbar";

/**
 * 全站 header：Navbar + S2.2 全螢幕選單，menuOpen state 自持。
 * 抽離自 Home：menu 開關只重渲染 header 子樹，不再重渲染整頁六大 section。
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* header 疊在全螢幕選單（z-40）之上，選單開啟時 menu 鈕仍可點擊關閉 */}
      <Section
        as="header"
        id="navbar"
        background={menuOpen ? "ink" : "brand-soft"}
        className="relative z-50"
      >
        {/* Navbar 為滿版 bar（右側深色塊貼齊視窗右緣），不走 SectionContainer */}
        <Navbar onMenuClick={toggleMenu} menuOpen={menuOpen} />
      </Section>
      <FullscreenMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
