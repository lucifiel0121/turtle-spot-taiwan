import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * S4.2 單元測試設定（Vitest + jsdom + Testing Library）。
 * coverage exclude 決策：
 * - components/ui/**：shadcn CLI 產物（button / carousel），非本專案手寫邏輯，
 *   視同第三方程式碼不列入覆蓋率（消費端行為已於 photo-carousel 測試覆蓋）
 * - pages/_document.tsx：Next.js 框架 glue（Html / Main / NextScript），
 *   無法於 jsdom 脫離 Next render pipeline 渲染，由 `next build` 驗證
 * - next.config.ts / postcss / eslint 等設定檔：build 工具設定，非執行期邏輯
 *   （coverage include 僅圈 lib / components / pages，設定檔天然不入列）
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    environment: "jsdom",
    css: false,
    setupFiles: ["tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: [["text", { skipFull: false }], ["text-summary"]],
      // 限定 ts/tsx：目錄下的 .DS_Store 等非程式檔會讓 v8 remap 解析失敗
      include: [
        "lib/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "pages/**/*.{ts,tsx}",
      ],
      exclude: ["components/ui/**", "pages/_document.tsx"],
      thresholds: { lines: 80 },
    },
  },
});
