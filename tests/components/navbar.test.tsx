import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Navbar } from "@/components/navbar";

describe("Navbar", () => {
  it("渲染 logo 連結與三顆功能鈕", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: "Turtle Spot Taiwan home" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("button", { name: "Switch language" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sounds" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
  });

  it("點 menu 鈕呼叫 onMenuClick", async () => {
    const user = userEvent.setup();
    const onMenuClick = vi.fn();
    render(<Navbar onMenuClick={onMenuClick} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("menuOpen 切換 aria-expanded 與 aria-label", () => {
    const { rerender } = render(<Navbar menuOpen={false} />);
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");

    rerender(<Navbar menuOpen />);
    const closeButton = screen.getByRole("button", { name: "Close menu" });
    expect(closeButton).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.queryByRole("button", { name: "Open menu" }),
    ).not.toBeInTheDocument();
  });
});
