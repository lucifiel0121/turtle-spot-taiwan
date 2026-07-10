import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Noto_Sans_TC } from "next/font/google";

// Satoshi（設計稿指定字體）以全域 @font-face 自托管載入（見 styles/globals.css）。
const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${notoSansTC.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
}
