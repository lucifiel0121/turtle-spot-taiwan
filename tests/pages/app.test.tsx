import { render, screen } from "@testing-library/react";
import type { AppProps } from "next/app";
import { describe, expect, it, vi } from "vitest";

import App from "@/pages/_app";

// next/font 需要 Next.js compiler transform，Vitest 環境以替身注入 className
vi.mock("next/font/google", () => ({
  Poppins: () => ({ variable: "--font-poppins", className: "font-poppins" }),
  Noto_Sans_TC: () => ({
    variable: "--font-noto-sans-tc",
    className: "font-noto-sans-tc",
  }),
}));

function DummyPage({ message }: { readonly message: string }) {
  return <p>{message}</p>;
}

describe("App", () => {
  it("以字體 variable wrapper 渲染頁面元件並透傳 pageProps", () => {
    const props = {
      Component: DummyPage,
      pageProps: { message: "hello app" },
    } as unknown as AppProps;

    const { container } = render(<App {...props} />);

    expect(screen.getByText("hello app")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(
      "--font-poppins",
      "--font-noto-sans-tc",
      "font-sans",
    );
  });
});
