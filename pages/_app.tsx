import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Noto_Sans_TC, Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${poppins.variable} ${notoSansTC.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  );
}
