# 設計疑義清單（Design Questions）

實作原則：**設計 100% 忠實實作，發現疑義只記錄、不擅改。**
本文件彙整實作過程中設計稿未定義、語意模糊、或素材限制導致需要「記錄中的詮釋」的項目，供 README「遇到的困難」一節引用，並作為日後與設計師對稿的清單。每項包含四個欄位：疑義描述、實作採用的詮釋、依據／量測、若設計稿澄清後的調整成本；涉及設計稿本身問題的項目（16–19）另附「建議提案（給設計方）」欄位。

素材背景：設計稿以 Figma 截圖形式取得 — Desktop 1440 為高解析整頁截圖（1407 x 4096 px），Pad 768 / Mobile 375 為低解析整頁縮圖；未取得 Figma 原始檔的變數表、字體資訊與互動規格。

## 疑義項目

### 1. Navbar language（EN）與 sounds 鈕的行為未定義

- **疑義描述**：設計稿呈現 EN（語言）與喇叭（音效）兩顆按鈕的外觀，但未定義點擊後的行為（切換語言？開關背景音？）。
- **實作採用的詮釋**：忠實渲染外觀（喇叭 icon 為白色，見第 19 條澄清），不接任何行為。
- **依據／量測**：`components/navbar.tsx` 檔頭註解「language / sounds 鈕行為設計未定義，先渲染不接行為」。
- **澄清後調整成本**：低 — 補上 onClick 與對應功能（i18n 切換或音效 toggle），版面不動。

### 2. 全螢幕選單導覽項與社群連結目的地未定義

- **疑義描述**：全螢幕選單的五個導覽項，以及選單內與 footer 的 Facebook / Instagram 連結，設計稿僅給文字、未給目的地 URL。
- **實作採用的詮釋**：`href` 一律以 `#` 佔位，佔位常數集中管理（`content/footer.ts` 內註明「待補」）。
- **依據／量測**：`components/fullscreen-menu.tsx`（`PLACEHOLDER_HREF`）、`content/footer.ts` 註解。
- **澄清後調整成本**：極低 — 替換常數檔中的 href 即可。

### 3. Witness story progress dots：設計稿 10 顆屬示意

- **疑義描述**：設計稿卡片上緣畫 10 條 progress dots，但資料來自 activities API，筆數不受前端控制；10 顆是規格還是示意？
- **實作採用的詮釋**：視為示意，dots 數量改由 API 資料筆數驅動（實測目前恰為 10 筆，與設計稿一致）。
- **依據／量測**：`components/story-viewer.tsx`；S3.4 commit「dots 數量改由 API 資料筆數決定（實測 10 筆）」。
- **澄清後調整成本**：低 — 若規格為固定 10 顆，需補「超過 10 筆如何截斷／分組」的產品決策後再實作。

### 4. 原設計字體無法取得，以 Poppins + Noto Sans TC 替代

- **疑義描述**：截圖 metadata 未含字體資訊；英文 display 大字為幾何無襯線（疑似 Futura 系，無法免費取得），中文黑體亦不明。
- **實作採用的詮釋**：以特徵最接近的 Google Fonts 替代 — Poppins（正圓 `o`、單層 `a`）+ Noto Sans TC。因字形比例不同（設計稿 cap 146 / f 147 / x-height 101 / n 寬 98，換算 1440 畫布），hero 大字取誤差總和最小的 185px（f=144 吻合、x-height +3、cap −16），並以 translate-y 0.07em 將 x-height 中線對齊設計位置。
- **依據／量測**：`docs/design-tokens.md`「字體」節、`components/sections/hero.tsx` 檔頭量測。
- **澄清後調整成本**：中 — 取得原字體後需全站重校 display 字級與基線對齊（hero / dive-sites / witness 三處跑馬燈與各標題）。

### 5. Desktop Hero 區是否有 sponsor logo：metadata 與截圖矛盾

- **疑義描述**：早期取得的 metadata 描述 Hero 區有 sponsor logo，但 Desktop 1440 高解析截圖掃描實證該區無任何 logo（KEEP WALKING FUND 僅出現於 footer）。
- **實作採用的詮釋**：以截圖實證為準，Hero 區忠實不放；矛盾記錄於元件註解，不擅加。
- **依據／量測**：`components/sections/hero.tsx` 檔頭「Desktop 截圖 Hero 區掃描無 sponsor logo…記錄不擅加」。
- **澄清後調整成本**：低 — 若原稿 Hero 確有 logo 節點，補一個定位元素即可。

### 6. Carousel autoplay「一陣子沒操作會自動播放」語意模糊

- **疑義描述**：需求僅描述「一陣子沒操作會自動播放」，未定義初始是否自動播、暫停條件、恢復間隔與播放週期。
- **實作採用的詮釋**：載入即播（delay 4s）；任何互動（箭頭／dot／拖曳／鍵盤）即暫停；閒置 6s 後恢復；`prefers-reduced-motion: reduce` 時不自動播放。全部常數化（`AUTOPLAY_DELAY_MS = 4000`、`AUTOPLAY_RESUME_IDLE_MS = 6000`）。
- **依據／量測**：`components/sections/photo-carousel.tsx`；S3.2 commit（embla-carousel-autoplay 8.6.0 無法感知箭頭／dot 互動，故以 `playOnInit: false` + 自訂 idle timer 實作，經 node_modules `.d.ts` 核對）。
- **澄清後調整成本**：低 — 調整常數即可；若語意改為「初始不播、閒置才播」亦僅改初始化分支。

### 7. API description 為長段落 vs 設計稿單行短文

- **疑義描述**：設計稿故事卡的 description 為單行短文，實際 API 回傳可為長段落，直接渲染會撐破 558x680 的固定卡面。
- **實作採用的詮釋**：以 `line-clamp-4 md:line-clamp-5` 做視覺截斷防撐破；資料仍完整渲染進 DOM，僅視覺裁切。
- **依據／量測**：`components/sections/witness-story.tsx`（chip 樣式 + line-clamp）。
- **澄清後調整成本**：低 — 若規格為卡片高度隨內容伸縮或改捲動，調整卡面高度策略即可。

### 8. Pad / Mobile 設計稿為低解析縮圖，量測含 ±10% 不確定度

- **疑義描述**：768 / 375 兩檔僅取得低解析整頁縮圖，字級與間距以 PIL 放大後像素量測換算，模糊邊緣造成約 ±10% 誤差；且 S2 階段兩檔尚未取得縮圖，部分版面先以 Desktop 同比縮放假設實作、S4.1 才逐 section 校正。
- **實作採用的詮釋**：以縮圖實測值為準（如三處跑馬燈字級 md ≈0.58×desktop、base ≈0.42×desktop），並於各元件檔頭註解標記「blur ±10%」與所取定值。
- **依據／量測**：`components/sections/{hero,dive-sites,witness-story,footer,turtle-profile}.tsx`、`components/story-viewer.tsx` 檔頭量測註解；S4.1 commit。
- **澄清後調整成本**：中 — 取得高解析 Pad / Mobile 稿後需逐 section 重校字級與間距（版面結構已對齊，僅數值微調）。

### 9. Mobile witness story 無側邊箭頭：手勢為主要換頁方式

- **疑義描述**：Mobile 設計稿的故事卡無左右箭頭（Desktop / Pad 有），未說明 Mobile 的換頁方式。
- **實作採用的詮釋**：忠實隱藏箭頭（`md` 起才顯示），swipe 手勢為 Mobile 主要換頁方式；progress dots 仍可點擊跳頁，作為輔助與 a11y 退路。
- **依據／量測**：`components/story-viewer.tsx` 檔頭「Mobile 設計稿無側邊箭頭（導覽靠 swipe 與 dots）」；S4.1 commit。
- **澄清後調整成本**：低 — 若 Mobile 應有箭頭，移除 breakpoint 條件即可。

### 10. Story viewer 首末頁行為：箭頭恆顯示、無 disabled 樣式線索

- **疑義描述**：靜態設計稿的左右箭頭恆顯示，無 disabled / 隱藏狀態的樣式線索，無法得知第一頁按「上一頁」、最後一頁按「下一頁」的預期行為。
- **實作採用的詮釋**：採 loop 循環（首頁往前 → 末頁、末頁往後 → 首頁），與 photo-carousel `loop: true` 的慣例一致。
- **依據／量測**：`components/story-viewer.tsx` 檔頭與 `wrapIndex` 純函式（S4.2 有邊界單元測試）。
- **澄清後調整成本**：低 — 若規格為到底停住，改 `wrapIndex` 為 clamp 並補 disabled 樣式。

### 11. 跑馬燈速度與方向：靜態稿無動態規格

- **疑義描述**：三處跑馬燈大字（Information / Favorite Dive Site / Witness story）在靜態截圖中無法得知捲動速度與方向。
- **實作採用的詮釋**：速度以「一輪循環秒數」參數化（`durationSeconds`，共用預設 20s、三處 section 設 15s），方向預設向左；`prefers-reduced-motion: reduce` 時停止（WCAG 2.2.2）。
- **依據／量測**：`components/marquee.tsx` props 註解與 `DEFAULT_DURATION_SECONDS`。
- **澄清後調整成本**：極低 — 調整各呼叫端常數即可。

### 12. Hero 海龜照朝向與設計稿相反（設計稿為素材鏡像）

- **疑義描述**：設計稿 Hero 圓照中海龜頭朝右，但子樹內同一張照片素材（`hero-turtle.jpeg`）原始朝向為左，設計稿實為素材的水平鏡像；不確定鏡像是刻意構圖還是排版偶然。
- **實作採用的詮釋**：忠實對齊設計稿呈現，以 `-scale-x-100` 水平翻轉。
- **依據／量測**：`components/sections/hero.tsx` 檔頭「設計稿為 public/images/hero-turtle.jpeg 的水平鏡像」。
- **澄清後調整成本**：極低 — 移除一個 className。

### 13. KEEP WALKING FUND sponsor logo 無原始資產

- **疑義描述**：footer 的 sponsor logo（THE KEEP WALKING FUND 夢想資助計畫）在設計稿子樹內無可匯出的圖檔資產，僅能自截圖觀察外觀。
- **實作採用的詮釋**：以文字排版 + CSS 半框線 + 簡易 SVG 走路人剪影近似重現截圖樣式。
- **依據／量測**：`components/sections/footer.tsx`（`WalkingFigure` SVG）、`content/footer.ts` logo 文字組成；S2.7 commit。
- **澄清後調整成本**：中低 — 取得原始 logo 圖檔後以 `<Image>` 替換，周邊排版不動。

### 14. 色彩 token 以截圖像素取樣推導，非官方變數表

- **疑義描述**：未取得 Figma 變數 / style 定義，色彩只能自截圖推導；反鋸齒與截圖壓縮可能使 hex 與原稿有微小偏差。
- **實作採用的詮釋**：對各關鍵區塊做矩形取樣、以像素眾數（mode）決定色值，整理為 7 個語意化 token（`--color-brand` 等），取樣座標與佔比全數記錄。
- **依據／量測**：`docs/design-tokens.md` 色彩表（含每個 token 的取樣座標與眾數佔比）、`styles/globals.css` `@theme`。
- **澄清後調整成本**：低 — token 集中定義，對照官方變數表逐值替換即可全站生效。

### 15. 日期顯示格式：API 回傳與設計稿呈現不一致

- **疑義描述**：API Date scalar 實測回傳 `YYYY-MM-DD`，設計稿卡片顯示 `YYYY/MM/DD`；設計稿上的日期是否即為顯示格式規格，未明文定義。
- **實作採用的詮釋**：以設計稿呈現為準，`formatActivityDate` 做純字串轉換（刻意不經 `Date` 物件，避免 UTC／本地時區位移把日期推移一天）；格式不符時原樣返回、不丟錯。
- **依據／量測**：`lib/format-date.ts` 檔頭註解與 S4.2 單元測試。
- **澄清後調整成本**：極低 — 改轉換函式即可。

### 16. 聯絡 email 兩處不一致：選單 info@gmail.com vs footer tstservice@gmail.com

- **疑義描述**：全螢幕選單「聯絡我們」顯示 `info@gmail.com`，footer「contact us :」顯示 `tstservice@gmail.com`，設計稿兩處原文即不一致，無法得知何者為正。
- **實作採用的詮釋**：兩處均忠實保留設計稿原文、不擅自統一；文案已集中常數檔（`content/menu.ts` / `content/footer.ts`）。
- **依據／量測**：Figma Desktop 1440 整頁截圖選單覆蓋層與 footer 區逐字核對。
- **建議提案（給設計方）**：確認正式聯絡信箱後統一兩處。
- **澄清後調整成本**：極低 — 改常數檔中一個字串即可全站生效。

### 17. Carousel autoplay 閒置後必恢復，使用者無法「持續暫停」（WCAG 2.2.2）

- **疑義描述**：需求「一陣子沒操作會自動播放」意味任何互動造成的暫停在閒置 6 秒後必然恢復；WCAG 2.2.2（Pause, Stop, Hide）要求自動移動內容須提供「可持續生效」的暫停機制，自動恢復使暫停形同失效。
- **實作採用的詮釋**：忠實依需求語意實作（互動暫停、閒置 `AUTOPLAY_RESUME_IDLE_MS = 6000` 後恢復）；僅 `prefers-reduced-motion: reduce` 時完全不自動播放。
- **依據／量測**：`components/sections/photo-carousel.tsx`（idle timer 實作與常數）；本清單第 6 項。
- **建議提案（給設計方）**：提供顯式播放／暫停切換鈕（暫停後不自動恢復），或改為「使用者互動後即永久停止自動播放」。
- **澄清後調整成本**：低 — 拿掉 idle 恢復 timer 或加一顆 toggle 鈕，autoplay 常數與分支已集中。

### 18. 跑馬燈無任何暫停機制（WCAG 2.2.2）

- **疑義描述**：三處跑馬燈大字（Information / Favorite Dive Site / Witness story）自動捲動且超過 5 秒，設計稿未提供暫停／停止控制；WCAG 2.2.2 要求此類移動內容須有使用者可操作的暫停機制，`prefers-reduced-motion` 僅涵蓋有設定該偏好的使用者。
- **實作採用的詮釋**：忠實依靜態稿實作純裝飾捲動（第二份內容 `aria-hidden`），僅 `prefers-reduced-motion: reduce` 時停止。
- **依據／量測**：`components/marquee.tsx`、`styles/globals.css`（`.marquee-track` 與 reduced-motion 規則）；本清單第 11 項。
- **建議提案（給設計方）**：增加 hover／focus 暫停加一顆顯式暫停鈕；或確認跑馬燈屬純裝飾後接受風險並於驗收記錄。
- **澄清後調整成本**：低 — CSS `animation-play-state` 即可實作暫停，Marquee 為三處共用元件、單點修改。

### 19. Sounds icon 顏色（已澄清：白色）

- **疑義描述**：實作期自 Desktop 1440 截圖取樣將喇叭 icon 判為純黑（疊 ink 底對比僅 1.09:1，曾列 WCAG 1.4.11 疑慮）；後經設計稿局部放大截圖澄清，icon 實為白色（與同列 EN、MENU 一致），初始取樣受反鋸齒／縮圖污染誤判。
- **實作採用的詮釋**：icon 繼承容器 `text-white`，與 EN 文字一致；對比疑慮隨之消失。
- **依據／量測**：設計稿 navbar 局部放大截圖（2026-07-10 澄清）；`components/navbar.tsx`（Volume2 icon）。
- **澄清後調整成本**：已調整完畢（移除 `text-black`）。

## 總結

| 類別 | 項次 |
| --- | --- |
| 行為／互動未定義 | 1, 2, 6, 9, 10, 11 |
| 素材／規格無法取得 | 4, 13, 14 |
| 設計稿與資料（API）落差 | 3, 7, 15 |
| 截圖證據限制與矛盾 | 5, 8, 12 |
| 設計稿內部不一致 | 16 |
| 無障礙（WCAG）疑慮 | 17, 18, 19 |

所有詮釋均已常數化或集中管理（`content/` 文案常數、token 於 `@theme`、行為參數具名常數），設計稿澄清後多數項目可在單點修改完成調整。
