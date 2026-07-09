# Design Tokens — Turtle Spot Taiwan

取樣來源：Figma「Desktop 1440」frame 整頁高解析截圖（1407 x 4096 px）。
方法：PIL 對各關鍵區塊做矩形取樣、以像素眾數（mode）決定色值，括號為該色在取樣區內的佔比。
Token 定義位置：`styles/globals.css` 的 `@theme` 區塊（Tailwind v4），命名刻意避開 shadcn/ui 既有 tokens（`background` / `primary` / `accent` 等），不覆寫任何 shadcn 變數。

## 色彩

| Token | Hex | 用途 | 取樣位置（原圖 px 座標） |
| --- | --- | --- | --- |
| `--color-brand` | `#00cad7` | 品牌主青色：footer 背景、footer「Turtle Spot Taiwan」標題字 | footer (41,4018)-(615,4079)，眾數 100% |
| `--color-brand-soft` | `#aaf5fa` | 淺青底：navbar 左半、hero 區、witness 區背景、「花瓶岩」map-pin 卡填色、VIEW POST 按鈕框線 | hero (30,90)-(400,240)，眾數 100% |
| `--color-foam` | `#f5fcff` | 冷白：hero「Information」/ witness「Witness story」跑馬燈大字、「美人洞」白色 map-pin 卡 | hero 大字 (62,300)-(120,400)，眾數 50%（餘為淺青底） |
| `--color-surface-mist` | `#e5eef0` | 淺灰藍：照片 carousel 區塊背景 | (184,1435)-(328,1476)，眾數 100% |
| `--color-surface-card` | `#ffffff` | 純白：海龜資訊卡片背景 | 資訊卡 (310,700)-(1100,930)，眾數 93% |
| `--color-ink` | `#161616` | 近黑：navbar 右半（EN/中/MENU）、Favorite Dive Site 區背景、witness story 手機卡、深色文字 | dive-site 區 (512,2214)-(861,2317)，眾數 100% |
| `--color-ink-soft` | `#50535e` | 暗灰：Favorite Dive Site 黑底上的灰色跑馬燈大字 | 「F」字腹 (10,2540)-(45,2580)，眾數 57% |

觀察備註：

- 設計稿的青色系有兩階 — 淺青 `#aaf5fa`（大面積底色）與飽和青 `#00cad7`（footer / 強調），沒有第三種青色。
- 深色系統一使用 `#161616`（navbar、黑底區、手機卡與深色文字皆同值），僅 dive-site 跑馬燈字另用 `#50535e`。
- 跑馬燈大字在青底上不是純白，而是帶冷調的 `#f5fcff`。

## 字體

| 對象 | 原設計特徵（自截圖觀察） | 替代字體（Google Fonts） | 理由 |
| --- | --- | --- | --- |
| 英文 display 大字（Information / Favorite Dive Site / Witness story、標題、編號） | 幾何無襯線（geometric sans）、`o` 近正圓、單層 `a`、平切端點、粗壯字重、無圓角 | **Poppins**（400/500/600/700） | Google Fonts 中最接近的幾何無襯線：正圓 `o`、單層 `a`、x-height 與比例相符；Futura 系原字體無法免費取得 |
| 繁體中文內文（資訊卡、pin 卡、故事卡） | 現代黑體、筆畫均勻、中性 | **Noto Sans TC**（400/500/700） | 與幾何無襯線搭配自然、字重齊全、繁中覆蓋完整 |

> 注意：以上皆**非原設計字體**，為特徵最接近的 Google Fonts 替代。原字體未在截圖 metadata 中取得，若日後拿到 Figma 字體資訊可再校正。

掛載方式：`pages/_app.tsx` 以 `next/font/google` 載入並輸出 CSS 變數 `--font-poppins`、`--font-noto-sans-tc`，接進 `@theme` 的 `--font-display` 與 `--font-sans`：

- `font-display`（Tailwind utility：`font-display`）→ 英文大字 / 標題
- `font-sans`（預設，`_app.tsx` wrapper 已套用）→ 內文（英文落 Poppins、中文 fallback Noto Sans TC）

## 資產清單（public/images/）

| 檔名 | 內容 | 用在哪個 section |
| --- | --- | --- |
| `hero-turtle.jpeg` | 海龜下潛掠過珊瑚礁、水面橘色反光 | Hero 圓形照片；**同一張**也用於 Carousel 主圖 |
| `turtle-face-left.jpeg` | 海龜近拍、深色岩石背景 | 海龜資訊卡「左臉」照片 |
| `turtle-face-right.jpeg` | 海龜與銀色魚群、沙地 | 海龜資訊卡「右臉」照片 |

此 3 張為設計稿子樹內全部的 photo fills（來源檔名 `figma-raw-{1,2,3}.jpeg`，已依用途重新命名）。Carousel 的側邊縮圖在設計稿中同樣復用這批照片。
