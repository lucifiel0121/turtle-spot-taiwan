import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WitnessStory } from "@/components/sections/witness-story";
import type { Activity } from "@/types/activity";
import { makeActivity } from "../helpers/fixtures";

const useActivitiesMock = vi.fn();

vi.mock("@/lib/activities", () => ({
  useActivities: (...args: unknown[]) => useActivitiesMock(...args),
}));

type HookState = {
  readonly activities: readonly Activity[];
  readonly error: unknown;
  readonly isLoading: boolean;
};

function stubActivities(state: HookState) {
  useActivitiesMock.mockReturnValue(state);
}

function renderWithActivities(activities: readonly Activity[]) {
  stubActivities({ activities, error: undefined, isLoading: false });
  return render(<WitnessStory fallbackActivities={[]} />);
}

beforeEach(() => {
  useActivitiesMock.mockReset();
});

describe("WitnessStory null 欄位（description × post_link 四組合）", () => {
  it("兩欄位皆有值：description 與 VIEW POST 都渲染", () => {
    renderWithActivities([makeActivity()]);
    expect(screen.getByText("在花瓶岩目擊綠蠵龜")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "VIEW POST" })).toBeInTheDocument();
  });

  it("description = null：描述節點不存在，VIEW POST 仍在", () => {
    const { container } = renderWithActivities([
      makeActivity({ description: null }),
    ]);
    expect(screen.queryByText("在花瓶岩目擊綠蠵龜")).not.toBeInTheDocument();
    expect(container.querySelectorAll("p.line-clamp-4")).toHaveLength(0);
    expect(screen.getByRole("link", { name: "VIEW POST" })).toBeInTheDocument();
  });

  it("post_link = null：VIEW POST 節點不存在，描述仍在", () => {
    renderWithActivities([makeActivity({ post_link: null })]);
    expect(screen.getByText("在花瓶岩目擊綠蠵龜")).toBeInTheDocument();
    expect(screen.queryByText("VIEW POST")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("兩欄位皆 null：描述與 VIEW POST 都不渲染，date/title 仍在", () => {
    renderWithActivities([
      makeActivity({ description: null, post_link: null }),
    ]);
    expect(screen.getByText("2024/10/29")).toBeInTheDocument();
    expect(screen.getByText("海龜點點名")).toBeInTheDocument();
    expect(screen.queryByText("在花瓶岩目擊綠蠵龜")).not.toBeInTheDocument();
    expect(screen.queryByText("VIEW POST")).not.toBeInTheDocument();
  });
});

describe("WitnessStory VIEW POST 安全檢查", () => {
  it("不安全 URL（javascript:）整鈕不渲染", () => {
    renderWithActivities([
      makeActivity({ post_link: "javascript:alert(1)" }),
    ]);
    expect(screen.queryByText("VIEW POST")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("非絕對 URL（相對路徑）整鈕不渲染", () => {
    renderWithActivities([makeActivity({ post_link: "/relative" })]);
    expect(screen.queryByText("VIEW POST")).not.toBeInTheDocument();
  });

  it("安全 URL：新分頁開啟且帶 rel noopener noreferrer", () => {
    renderWithActivities([makeActivity()]);
    const link = screen.getByRole("link", { name: "VIEW POST" });
    expect(link).toHaveAttribute("href", "https://example.com/post/1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("WitnessStory 三態與資料呈現", () => {
  it("loading：顯示載入中佔位卡", () => {
    stubActivities({ activities: [], error: undefined, isLoading: true });
    render(<WitnessStory fallbackActivities={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "目擊動態載入中……",
    );
  });

  it("error：顯示載入失敗佔位卡", () => {
    stubActivities({
      activities: [],
      error: new Error("boom"),
      isLoading: false,
    });
    render(<WitnessStory fallbackActivities={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "目擊動態載入失敗，請稍後再試。",
    );
  });

  it("empty：顯示無資料佔位卡", () => {
    renderWithActivities([]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "目前沒有目擊動態。",
    );
  });

  it("有資料：渲染 viewer（region）、日期格式化、dots 數 = 筆數", () => {
    renderWithActivities([
      makeActivity(),
      makeActivity({ title: "第二則", date: "2024-11-03" }),
    ]);
    expect(
      screen.getByRole("region", { name: "目擊動態" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2024/10/29")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "跳至第 2 則" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("fallback 路徑：首屏即渲染卡片內容、無 loading 佔位卡", () => {
    // fallbackActivities 經 useActivities（SWR fallbackData）回流：
    // 斷言使用者可見結果（卡片內容直出），不驗 mock 呼叫參數
    const fallback = [makeActivity({ title: "首屏直出的目擊" })];
    stubActivities({
      activities: fallback,
      error: undefined,
      isLoading: false,
    });
    render(<WitnessStory fallbackActivities={fallback} />);
    expect(screen.getByText("首屏直出的目擊")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
