import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Section, SectionContainer } from "@/components/layout/section";
import { MapPinCard } from "@/components/map-pin-card";
import { Marquee } from "@/components/marquee";
import { DiveSites } from "@/components/sections/dive-sites";
import { Footer } from "@/components/sections/footer";
import { HeroInformation } from "@/components/sections/hero";
import { TurtleProfile } from "@/components/sections/turtle-profile";
import { DIVE_SITE_CARDS } from "@/content/dive-sites";
import { FOOTER } from "@/content/footer";
import { TURTLE_PROFILE } from "@/content/turtle-profile";

describe("Marquee", () => {
  it("內容渲染兩份且第二份 aria-hidden（螢幕閱讀器只讀一次）", () => {
    const { container } = render(<Marquee words={["跑馬燈內容"]} />);
    expect(screen.getAllByText("跑馬燈內容")).toHaveLength(2);
    const copies = container.querySelectorAll(".marquee-track > div");
    expect(copies[1]).toHaveAttribute("aria-hidden", "true");
  });

  it("durationSeconds 與 direction 反映到 track style", () => {
    const { container } = render(
      <Marquee words={["內容"]} durationSeconds={15} direction="right" />,
    );
    const track = container.querySelector<HTMLElement>(".marquee-track");
    expect(track?.style.getPropertyValue("--marquee-duration")).toBe("15s");
    expect(track?.style.animationDirection).toBe("reverse");
  });

  it("預設向左（animationDirection normal）", () => {
    const { container } = render(<Marquee words={["內容"]} />);
    const track = container.querySelector<HTMLElement>(".marquee-track");
    expect(track?.style.animationDirection).toBe("normal");
  });

  it("repeat 重複 words 湊寬：每份內容 words × repeat 個 span", () => {
    render(<Marquee words={["Witness story"]} repeat={2} />);
    // 兩份 copy × repeat 2 = 4
    expect(screen.getAllByText("Witness story")).toHaveLength(4);
  });

  it("每個詞 span 內建 whitespace-nowrap 與尾端間距", () => {
    render(<Marquee words={["Information"]} repeat={3} />);
    const spans = screen.getAllByText("Information");
    expect(spans).toHaveLength(6);
    for (const span of spans) {
      expect(span).toHaveClass("whitespace-nowrap", "pr-8");
    }
  });
});

describe("Section / SectionContainer", () => {
  it("背景 token 對映 class，as 可換標籤", () => {
    const { container } = render(
      <Section as="header" id="navbar" background="brand-soft">
        內容
      </Section>,
    );
    const header = container.querySelector("header#navbar");
    expect(header).not.toBeNull();
    expect(header).toHaveClass("bg-brand-soft");
  });

  it("預設標籤為 section、不附帶額外內距 class", () => {
    const { container } = render(
      <Section background="ink">內容</Section>,
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-ink", "w-full");
    expect(section?.className).not.toMatch(/py-/);
  });

  it("SectionContainer 置中收斂內容寬", () => {
    const { container } = render(
      <SectionContainer>內容</SectionContainer>,
    );
    expect(container.firstChild).toHaveClass("mx-auto", "max-w-6xl");
  });
});

describe("MapPinCard", () => {
  it("渲染上標與地名，variant 對映填色 class", () => {
    const { container } = render(
      <MapPinCard variant="brand-soft" label="最愛潛點" name="花瓶岩" />,
    );
    expect(screen.getByText("最愛潛點")).toBeInTheDocument();
    expect(screen.getByText("花瓶岩")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-brand-soft");
  });

  it("foam variant 對映白色填色", () => {
    const { container } = render(
      <MapPinCard variant="foam" label="最愛潛點" name="美人洞" />,
    );
    expect(container.firstChild).toHaveClass("text-foam");
  });
});

describe("靜態 sections smoke render", () => {
  it("HeroInformation：跑馬燈大字與海龜圓照", () => {
    render(<HeroInformation />);
    expect(screen.getAllByText("Information").length).toBeGreaterThan(0);
    expect(
      screen.getByAltText("綠蠵龜在珊瑚礁上方悠游"),
    ).toBeInTheDocument();
  });

  it("TurtleProfile：tab、欄位列與左右臉照片", () => {
    render(<TurtleProfile />);
    expect(screen.getByText(TURTLE_PROFILE.tab.name)).toBeInTheDocument();
    for (const field of TURTLE_PROFILE.fields) {
      expect(
        screen.getByText(`${field.label}：${field.value}`),
      ).toBeInTheDocument();
    }
    for (const photo of TURTLE_PROFILE.photos) {
      expect(screen.getByAltText(photo.alt)).toBeInTheDocument();
    }
  });

  it("DiveSites：兩張 map-pin 卡錯落渲染", () => {
    render(<DiveSites />);
    expect(
      screen.getAllByText(DIVE_SITE_CARDS.primary.name).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(DIVE_SITE_CARDS.secondary.name).length,
    ).toBeGreaterThan(0);
  });

  it("Footer：標題、版權與 contact 連結", () => {
    render(<Footer />);
    expect(screen.getByText(FOOTER.title)).toBeInTheDocument();
    expect(screen.getByText(FOOTER.copyright)).toBeInTheDocument();
    for (const link of FOOTER.contact.links) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href,
      );
    }
  });
});
