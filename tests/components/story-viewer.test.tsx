import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  StoryViewer,
  SWIPE_THRESHOLD_PX,
  clampIndex,
  resolveSwipeDirection,
  wrapIndex,
} from "@/components/story-viewer";

describe("wrapIndex", () => {
  it("範圍內原樣返回", () => {
    expect(wrapIndex(0, 5)).toBe(0);
    expect(wrapIndex(4, 5)).toBe(4);
  });

  it("超出上界 loop 回開頭", () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(6, 5)).toBe(1);
  });

  it("低於下界 loop 回結尾", () => {
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(-6, 5)).toBe(4);
  });

  it("count <= 0 一律回 0（防呆）", () => {
    expect(wrapIndex(3, 0)).toBe(0);
    expect(wrapIndex(-1, -2)).toBe(0);
  });
});

describe("clampIndex", () => {
  it("範圍內原樣返回、超出上界收斂到末筆", () => {
    expect(clampIndex(0, 5)).toBe(0);
    expect(clampIndex(4, 5)).toBe(4);
    expect(clampIndex(7, 5)).toBe(4);
  });

  it("負值收斂到 0；count <= 0 一律回 0（防呆）", () => {
    expect(clampIndex(-3, 5)).toBe(0);
    expect(clampIndex(3, 0)).toBe(0);
    expect(clampIndex(3, -1)).toBe(0);
  });
});

describe("resolveSwipeDirection", () => {
  it("向左滑（dx 負）達門檻回 next、向右滑回 prev", () => {
    expect(resolveSwipeDirection(-60, 0)).toBe("next");
    expect(resolveSwipeDirection(60, 0)).toBe("prev");
  });

  it("門檻邊界：|dx| 恰等於門檻算換頁、差 1px 不算", () => {
    expect(resolveSwipeDirection(SWIPE_THRESHOLD_PX, 0)).toBe("prev");
    expect(resolveSwipeDirection(-SWIPE_THRESHOLD_PX, 0)).toBe("next");
    expect(resolveSwipeDirection(SWIPE_THRESHOLD_PX - 1, 0)).toBeNull();
  });

  it("斜向／垂直主導（|dx| <= |dy|）回 null，不與捲動衝突", () => {
    expect(resolveSwipeDirection(-60, 70)).toBeNull();
    expect(resolveSwipeDirection(60, -60)).toBeNull();
    expect(resolveSwipeDirection(0, 100)).toBeNull();
  });

  it("自訂門檻生效", () => {
    expect(resolveSwipeDirection(-20, 0, 10)).toBe("next");
    expect(resolveSwipeDirection(-20, 0, 30)).toBeNull();
  });
});

const ITEMS = ["第一則", "第二則", "第三則"] as const;

const ITEMS_EIGHT = [
  "第一則",
  "第二則",
  "第三則",
  "第四則",
  "第五則",
  "第六則",
  "第七則",
  "第八則",
] as const;

function renderViewer(
  renderAction?: (item: string, index: number) => React.ReactNode,
) {
  return render(
    <StoryViewer
      items={ITEMS}
      renderItem={(item) => <p>{item}</p>}
      header={<span>頭像列</span>}
      renderAction={renderAction}
      label="測試動態"
    />,
  );
}

describe("StoryViewer", () => {
  it("dots 數量 = 資料筆數，當前頁標 aria-current", () => {
    renderViewer();
    const dots = ITEMS.map((_, i) =>
      screen.getByRole("button", { name: `跳至第 ${i + 1} 則` }),
    );
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    expect(dots[1]).toHaveAttribute("aria-current", "false");
  });

  it("箭頭換頁：next 前進、prev 自首頁 loop 到末頁", async () => {
    const user = userEvent.setup();
    renderViewer();
    expect(screen.getByText("第一則")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "下一則" }));
    expect(screen.getByText("第二則")).toBeInTheDocument();
    expect(screen.queryByText("第一則")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "上一則" }));
    await user.click(screen.getByRole("button", { name: "上一則" }));
    expect(screen.getByText("第三則")).toBeInTheDocument();
  });

  it("末頁 next loop 回首頁", async () => {
    const user = userEvent.setup();
    renderViewer();
    const next = screen.getByRole("button", { name: "下一則" });
    await user.click(next);
    await user.click(next);
    await user.click(next);
    expect(screen.getByText("第一則")).toBeInTheDocument();
  });

  it("點 dots 跳頁並更新 aria-current", async () => {
    const user = userEvent.setup();
    renderViewer();
    await user.click(screen.getByRole("button", { name: "跳至第 3 則" }));
    expect(screen.getByText("第三則")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "跳至第 3 則" }),
    ).toHaveAttribute("aria-current", "true");

    // 往回跳（direction = prev 分支）
    await user.click(screen.getByRole("button", { name: "跳至第 1 則" }));
    expect(screen.getByText("第一則")).toBeInTheDocument();
  });

  it("swipe：水平滑動達門檻換頁、垂直滑動不換頁", () => {
    renderViewer();
    const region = screen.getByRole("region", { name: "測試動態" });

    fireEvent.pointerDown(region, { clientX: 200, clientY: 100 });
    fireEvent.pointerUp(region, { clientX: 120, clientY: 105 });
    expect(screen.getByText("第二則")).toBeInTheDocument();

    fireEvent.pointerDown(region, { clientX: 200, clientY: 100 });
    fireEvent.pointerUp(region, { clientX: 195, clientY: 300 });
    expect(screen.getByText("第二則")).toBeInTheDocument();

    // 向右滑回上一頁
    fireEvent.pointerDown(region, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(region, { clientX: 200, clientY: 100 });
    expect(screen.getByText("第一則")).toBeInTheDocument();
  });

  it("pointercancel（瀏覽器接手捲動）清空起點，不誤觸換頁", () => {
    renderViewer();
    const region = screen.getByRole("region", { name: "測試動態" });

    fireEvent.pointerDown(region, { clientX: 200, clientY: 100 });
    fireEvent.pointerCancel(region);
    fireEvent.pointerUp(region, { clientX: 100, clientY: 100 });
    expect(screen.getByText("第一則")).toBeInTheDocument();
  });

  it("renderAction 回傳 null 時動作列容器整個不渲染", () => {
    const { container } = renderViewer(() => null);
    expect(container.querySelector(".justify-center.pb-8")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
  });

  it("renderAction 有值時渲染動作列", () => {
    renderViewer((item) => <a href="https://example.com">{item} 連結</a>);
    expect(
      screen.getByRole("link", { name: "第一則 連結" }),
    ).toBeInTheDocument();
  });

  it("items 為空時整個 viewer 不渲染", () => {
    const { container } = render(
      <StoryViewer items={[]} renderItem={() => <p>never</p>} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("SWR revalidation 縮減 items 時 index clamp 到合法末筆，viewer 不空白", async () => {
    const user = userEvent.setup();
    const many = ITEMS_EIGHT;
    const { rerender } = render(
      <StoryViewer items={many} renderItem={(item) => <p>{item}</p>} />,
    );
    await user.click(screen.getByRole("button", { name: "跳至第 8 則" }));
    expect(screen.getByText("第八則")).toBeInTheDocument();

    // 模擬 SWR revalidation：items 縮成 5 筆，state index 7 已越界
    rerender(
      <StoryViewer
        items={many.slice(0, 5)}
        renderItem={(item) => <p>{item}</p>}
      />,
    );
    expect(screen.getByText("第五則")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^跳至第/ })).toHaveLength(5);
    expect(
      screen.getByRole("button", { name: "跳至第 5 則" }),
    ).toHaveAttribute("aria-current", "true");

    // 換頁以 clamp 後的 index 為基準：末筆 next loop 回首筆
    await user.click(screen.getByRole("button", { name: "下一則" }));
    expect(screen.getByText("第一則")).toBeInTheDocument();
  });

  it("pointerdown 時對卡片要求 pointer capture（拖出邊界仍收得到 pointerup）", () => {
    renderViewer();
    const region = screen.getByRole("region", { name: "測試動態" });
    const setPointerCapture = vi.fn();
    // jsdom 未實作 Pointer Capture API，mock 驗證呼叫參數
    Object.assign(region, { setPointerCapture });

    fireEvent.pointerDown(region, { clientX: 200, clientY: 100, pointerId: 7 });
    expect(setPointerCapture).toHaveBeenCalledWith(7);

    // capture 生效下 pointerup 回到卡片：拖出邊界的座標仍完成換頁
    fireEvent.pointerUp(region, { clientX: -500, clientY: 100, pointerId: 7 });
    expect(screen.getByText("第二則")).toBeInTheDocument();
  });

  it("swipe 起訖都在 anchor 上時一次性抑制 click，單純 click 正常", () => {
    const onAnchorClick = vi.fn((event: React.MouseEvent) =>
      event.preventDefault(),
    );
    renderViewer((item) => (
      <a href="https://example.com" onClick={onAnchorClick}>
        {item} 連結
      </a>
    ));
    const anchor = screen.getByRole("link", { name: "第一則 連結" });

    fireEvent.pointerDown(anchor, { clientX: 200, clientY: 100 });
    fireEvent.pointerUp(anchor, { clientX: 120, clientY: 100 });
    expect(screen.getByText("第二則")).toBeInTheDocument();

    // swipe 成立後緊跟的 click 於 capture phase 被 preventDefault（開新分頁
    // 的預設行為取消、dispatchEvent 回傳 false）+ stopPropagation（anchor
    // 自身 handler 收不到）
    const nextAnchor = screen.getByRole("link", { name: "第二則 連結" });
    expect(fireEvent.click(nextAnchor)).toBe(false);
    expect(onAnchorClick).not.toHaveBeenCalled();

    // 一次性抑制：後續單純 click 正常送達 anchor handler
    fireEvent.click(nextAnchor);
    expect(onAnchorClick).toHaveBeenCalledTimes(1);
  });
});
