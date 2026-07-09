# Turtle Spot Taiwan

海龜目擊回報網站的一頁式形象頁（landing page），彙整海龜保育資訊、潛點介紹與社群目擊回報，串接公開 GraphQL API 呈現即時目擊動態。

**Demo：[https://turtle-spot-taiwan-zeta.vercel.app](https://turtle-spot-taiwan-zeta.vercel.app)**

## 專案介紹

本專案為單頁式（one-page）網站，由上而下依序呈現六個主要區塊：

1. **Navbar** — 品牌識別與導覽入口，含全螢幕選單觸發
2. **Hero** — 海龜主視覺與品牌標語跑馬燈
3. **海龜資料卡** — 物種資訊，含雙欄資料列與圖片
4. **Photo carousel** — 中央大圖露出式照片輪播，具 autoplay 與互動暫停
5. **Favorite Dive Site** — 精選潛點卡片與跑馬燈標題
6. **Witness story** — 使用者目擊回報，類 Instagram 限時動態瀏覽器（story viewer），資料來自 GraphQL activities API 即時抓取

版面採 Desktop（1440）／Pad（768）／Mobile（375）三 breakpoint 響應式設計，並針對跑馬燈、輪播動畫等自動移動內容支援 `prefers-reduced-motion`。

## Tech Stack 與選型理由

| 技術 | 版本 | 選型理由 |
| --- | --- | --- |
| Next.js（Pages Router） | 16.2.10 | SSG 搭配 ISR 可將 GraphQL 資料在建置時預先渲染、背景增量更新，兼顧首屏效能與資料時效性 |
| React | 19.2.4 | 專案規模單頁為主，穩定性優先於 App Router 的漸進特性 |
| TypeScript | ^5 | 型別覆蓋資料層（GraphQL response）與元件 props，減少介面誤用 |
| Tailwind CSS | v4 | `@theme` 原生支援設計 token 語意化管理，配合本專案自像素取樣還原的色彩／字體系統 |
| shadcn/ui（Embla） | carousel 元件 | 提供無樣式（unstyled）輪播邏輯與拖曳／鍵盤操作基礎，樣式與互動細節（tween、autoplay 恢復）可完全客製以貼合設計稿 |
| SWR + graphql-request | 2.4.2 / 7.4.0 | `graphql-request` 提供輕量 GraphQL client，搭配 SWR 在 `getStaticProps` 產出的初始資料之上做前端 revalidate，兼顧 ISR 與資料新鮮度 |

## Getting Started

本專案使用 pnpm 管理套件。

```bash
pnpm install       # 安裝依賴
pnpm dev           # 開發模式（http://localhost:3000）
pnpm build         # production build（SSG + ISR）
pnpm start         # 啟動 production server
pnpm test          # 執行 Vitest 測試
pnpm test:coverage # 測試 + 覆蓋率報告
```

## 架構速覽

```
components/
├── layout/       # Section 版面容器
├── sections/      # 六大區塊（hero、turtle-profile、photo-carousel、dive-sites、witness-story、footer）
├── ui/            # shadcn/ui 基礎元件（button、carousel）
└── *.tsx          # 共用元件（navbar、fullscreen-menu、marquee、story-viewer 等）
lib/               # GraphQL client、資料轉換（activities、format-date）、URL 安全檢查
content/           # 各區塊文案與常數，與元件邏輯分離
pages/             # Next.js Pages Router 進入點
tests/             # Vitest 單元測試，鏡射 components/lib/pages 結構
```

資料流：`getStaticProps` 於建置時取得 activities 資料並以 ISR 定期重新產生，前端掛載後由 SWR 以相同 GraphQL query 做背景 revalidate，確保頁面在 CDN 快取期間仍可反映最新目擊回報。

## 開發過程描述

1. **設計稿判讀**：僅取得 Figma 截圖（Desktop 1440 高解析整頁、Pad 768／Mobile 375 低解析縮圖），無原始檔變數表與字體資訊。先以 PIL 對關鍵區塊做矩形取樣，以像素眾數決定色彩 token，並對照字形特徵（`o` 圓度、`a` 結構、x-height 比例）挑選特徵最接近的替代字體，取樣座標與換算過程整理於 `docs/design-tokens.md`。
2. **骨架與資料層先行**：專案初始化後，先建立 GraphQL 資料層（`lib/graphql.ts`、`lib/activities.ts`）與 `getStaticProps` + ISR + SWR 的資料流雛形，再開始拼版面，避免後續每個區塊各自處理資料串接。
3. **依序實作六大區塊**：由 Navbar／全螢幕選單開始，依視覺順序完成 Hero、海龜資料卡、Favorite Dive Site、Witness story、Footer，並在此階段抽出共用的 Marquee（跑馬燈）元件供三處大字重複使用。
4. **互動元件深化**：Photo carousel 在基礎版型完成後加入 autoplay、縮放／透明度 tween；Witness story 另建立類限時動態的 story viewer，處理進場動畫、swipe 手勢與鍵盤導覽。
5. **三 breakpoint RWD 校正**：待 Pad／Mobile 縮圖到位後，逐區塊比對並校正字級、間距與版面切換點，取代前期以 Desktop 同比縮放的暫定假設。
6. **測試與品質關卡**：以 Vitest 撰寫涵蓋資料轉換、互動邏輯與元件行為的單元測試（11 個檔案、87 案，statement coverage 98.44%），並另外執行三 viewport 的 headed 瀏覽器驗證，逐項勾稽 menu、carousel、story viewer 等互動行為與 `prefers-reduced-motion` 分支——headed 驗證過程中另發現並修復了單元測試（jsdom）無法重現的兩個瀏覽器層級缺陷（詳見下節）。
7. **重構收斂**：功能穩定後統一收斂重複結構（跑馬燈 props、story 卡尺寸常數、共用 LogoMark）、移除死碼與模板殘留，並將所有函式收斂至 50 行以內。
8. **部署與文件**：完成 production build 驗證後部署至 Vercel，並整理設計疑義清單與驗證報告作為交付文件。

**總工時：約 16 小時（2 個工作天）**，粗略分配：設計稿判讀與環境建置約 3 小時／六大 section 與互動元件實作約 7 小時／RWD 校正與測試約 4 小時／部署與文件整理約 2 小時。

## 遇到的困難與解法

- **原設計字體無法取得**：截圖 metadata 未含字體資訊，英文 display 大字為幾何無襯線（疑似 Futura 系）但無法免費取得。以 Google Fonts 中特徵最接近的 Poppins（正圓 `o`、單層 `a`）+ Noto Sans TC 替代，並實測設計稿字形比例（cap／x-height／字寬）換算出誤差最小的字級與基線位移，差異與換算過程記錄於 `docs/design-tokens.md`。
- **Carousel autoplay「閒置恢復」語意詮釋**：需求僅描述「一陣子沒操作會自動播放」，未定義暫停條件與恢復間隔。詮釋為載入即播、任一互動（箭頭／dot／拖曳／鍵盤）觸發暫停、閒置 6 秒後恢復，並將所有時間常數集中管理，同時記錄此設計隱含使用者無法「持續暫停」的 WCAG 2.2.2 疑慮供設計方參考。
- **第三方套件線上文件版本超前實際安裝版本**：`embla-carousel-autoplay` 線上文件描述的部分行為與 8.6.0 穩定版不符，改以 `node_modules` 內的 `.d.ts` 型別定義為準確認實際可用的 API 與參數，避免依錯誤文件實作出不存在的行為。
- **Pointer capture 導致卡片內點擊失效，僅瀏覽器可重現**：修正拖曳邊界行為時，在 `onPointerDown` 無條件呼叫 `setPointerCapture`，造成瀏覽器將後續 click 事件全數重新導向至卡片本身，story 卡內的 dots 與連結按鈕點擊完全失效。jsdom 未實作 Pointer Capture 與 click retargeting，單元測試因此全綠卻掩蓋了真實缺陷；改以 headed 瀏覽器實測配合 `elementFromPoint` 與 click 事件目標比對才定位根因。解法為將 capture 時機延後至位移超過門檻（確立拖曳意圖）才觸發，單純點擊不再被攔截。
- **選單開關間接導致輪播自動播放永久停止**：headed 端對端流程驗收時發現，開啟全螢幕選單會鎖定 body 捲動、造成 scrollbar 消失使版面寬度變化，進而觸發 Embla 的 `ResizeObserver` 重新初始化（`reInit`）；輪播的 autoplay 因初始化參數不會在 `reInit` 後自行恢復，且原本的閒置恢復計時器只掛在輪播區域本身的互動事件上，選單操作不在其上，導致自動播放永久停止且不會再恢復。解法是讓 autoplay 控制器額外監聽 Embla 的 `reInit` 事件並接手恢復播放，同時保留「閒置滿 6 秒才恢復」與 `prefers-reduced-motion` 不自動播放的既有語意。
- **設計稿內部資訊不一致**：全螢幕選單與 footer 兩處呈現的聯絡信箱文字不同（`info@gmail.com` 與 `tstservice@gmail.com`），逐字核對截圖確認並非誤讀而是設計稿本身的落差。依「設計 100% 忠實實作、不擅改」的原則，兩處均如實保留原文，僅記錄差異並附上統一建議供設計方確認，不自行決定何者為正。

## 測試

單元測試涵蓋率：statement 98.44%、branch 96.77%、function 100%（11 個測試檔案、87 案）。測試策略為單元測試聚焦資料轉換與元件邏輯層（純函式、hook 行為、edge case），瀏覽器層級的互動行為（pointer 事件、click retargeting、`ResizeObserver` 觸發的連鎖反應）則以三 viewport headed 瀏覽器驗證補足——這類行為在 jsdom 環境下無法真實重現，需要實際瀏覽器驗證才能發現。

## 延伸文件

- [設計疑義清單](docs/design-questions.md) — 實作過程中設計稿未定義、語意模糊或素材限制導致的詮釋記錄，共 19 項
- [驗證報告](docs/verify-report.md) — headed 瀏覽器三 viewport 驗證與端對端使用者流程驗收紀錄
