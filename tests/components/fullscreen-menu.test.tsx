import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FullscreenMenu } from "@/components/fullscreen-menu";

describe("FullscreenMenu", () => {
  it("open=false 時不渲染任何 DOM", () => {
    const { container } = render(
      <FullscreenMenu open={false} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("open=true 渲染 dialog 覆蓋層與導覽項", () => {
    render(<FullscreenMenu open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: "全站導覽選單" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    for (const item of ["Map", "Article", "About", "Resources"]) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
    expect(
      screen.getByRole("link", { name: "info@gmail.com" }),
    ).toHaveAttribute("href", "mailto:info@gmail.com");
  });

  it("開啟時鎖住 body scroll，關閉後還原原值", () => {
    document.body.style.overflow = "auto";
    const { rerender } = render(
      <FullscreenMenu open onClose={() => {}} />,
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<FullscreenMenu open={false} onClose={() => {}} />);
    expect(document.body.style.overflow).toBe("auto");
    document.body.style.overflow = "";
  });

  it("開啟時 focus 移入覆蓋層，關閉後 focus 回原觸發元素", () => {
    render(<button type="button">menu 鈕</button>);
    const trigger = screen.getByRole("button", { name: "menu 鈕" });
    trigger.focus();

    const { rerender } = render(<FullscreenMenu open onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toHaveFocus();

    rerender(<FullscreenMenu open={false} onClose={() => {}} />);
    expect(trigger).toHaveFocus();
  });

  it("focus trap：最後一個 focusable 按 Tab 循環回第一個、Shift+Tab 反向", () => {
    render(<FullscreenMenu open onClose={() => {}} />);
    const links = screen.getAllByRole("link");
    const first = links[0];
    const last = links[links.length - 1];

    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(first).toHaveFocus();

    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });

  it("focus trap：焦點在覆蓋層容器本身時 Shift+Tab 移到最後一個 focusable", () => {
    render(<FullscreenMenu open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: "全站導覽選單" });
    const links = screen.getAllByRole("link");
    expect(dialog).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(links[links.length - 1]).toHaveFocus();
  });

  it("focus trap：中間元素按 Tab 不攔截（交還瀏覽器預設行為）", () => {
    render(<FullscreenMenu open onClose={() => {}} />);
    const links = screen.getAllByRole("link");
    const middle = links[1];
    middle.focus();

    fireEvent.keyDown(middle, { key: "Tab" });
    // jsdom 不執行預設 Tab 移動；未被攔截時焦點應保持原位
    expect(middle).toHaveFocus();
  });

  it("按 Esc 呼叫 onClose", () => {
    const onClose = vi.fn();
    render(<FullscreenMenu open onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("按其他鍵不觸發 onClose；關閉狀態下 Esc 也不觸發", () => {
    const onClose = vi.fn();
    const { rerender } = render(<FullscreenMenu open onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();

    rerender(<FullscreenMenu open={false} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
