import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GetStaticPropsContext } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home, { getStaticProps } from "@/pages/index";
import type { Activity } from "@/types/activity";
import { makeActivity } from "../helpers/fixtures";
import { graphqlRequestMock as requestMock } from "../helpers/graphql-mock";
import { createSwrWrapper } from "../helpers/swr";

// 阻斷真實網路：graphql client 一律走 mock（SWR revalidate 也會打）
vi.mock("@/lib/graphql", async () => {
  const helper = await import("../helpers/graphql-mock");
  return helper.mockGraphqlModule();
});

// jsdom 無版面，embla 以 mock 替身運作（深度互動見 headed 驗證）
vi.mock("embla-carousel-react", async () => {
  const helper = await import("../helpers/embla-mock");
  return { default: helper.mockUseEmblaCarousel };
});

const ACTIVITY = makeActivity();

function renderHome(fallbackActivities: readonly Activity[]) {
  return render(<Home fallbackActivities={fallbackActivities} />, {
    wrapper: createSwrWrapper(),
  });
}

beforeEach(() => {
  requestMock.mockReset();
  requestMock.mockResolvedValue({ activities: [ACTIVITY] });
});

describe("getStaticProps", () => {
  it("fetch 成功：回傳 activities 與 ISR revalidate", async () => {
    const result = await getStaticProps({} as GetStaticPropsContext);
    expect(result).toEqual({
      props: { fallbackActivities: [ACTIVITY] },
      revalidate: 3600,
    });
  });

  it("fetch 失敗：不讓 build 掛掉，回傳空陣列並保留 revalidate", async () => {
    requestMock.mockRejectedValue(new Error("endpoint down"));
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const result = await getStaticProps({} as GetStaticPropsContext);

    expect(result).toEqual({
      props: { fallbackActivities: [] },
      revalidate: 3600,
    });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe("Home 頁面骨架", () => {
  it("六大 section 內容都渲染", async () => {
    renderHome([ACTIVITY]);

    expect(
      screen.getByRole("link", { name: "Turtle Spot Taiwan home" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Information").length).toBeGreaterThan(0);
    expect(screen.getByText("淡定哥")).toBeInTheDocument();
    expect(screen.getAllByText("花瓶岩").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("region", { name: "目擊動態" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("© 2021 Turtle Spot Taiwan"),
    ).toBeInTheDocument();
    // SWR 背景 revalidate 完成，避免 act warning
    await waitFor(() => expect(requestMock).toHaveBeenCalled());
  });

  it("menu 開關流程：點開 → Esc 關 → 再點開再點關", async () => {
    const user = userEvent.setup();
    renderHome([ACTIVITY]);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close menu" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
