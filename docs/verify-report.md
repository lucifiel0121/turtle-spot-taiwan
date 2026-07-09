# S5.5 Ship Gate 驗證報告 — Figma 對齊 headed 驗證與互動行為勾稽

- **驗證日期**：2026-07-10
- **驗證定位**：S5.3 大規模重構（Marquee API 改動、Section padding 檔位移除、SiteHeader 抽出、StoryViewer 拆分）後的 ship gate 級驗收，預設懷疑、逐項舉證。

## 驗證環境

| 項目 | 內容 |
|---|---|
| 執行模式 | `pnpm build` + `pnpm start`（production，Next.js 16.2.10 / Turbopack） |
| 瀏覽器 | Chromium（playwright-cli，headed），`http://localhost:3000` |
| Viewport | 1440×900、768×1024、375×812（整頁截圖 `verify-{1440,768,375}.png`） |
| 回歸基準 | S4.1 重構前整頁截圖 `final-{1440,768,375}.png` |
| 設計稿參照 | Desktop：Figma 1440 高解析整頁截圖；Pad/Mobile：768/375 低解析整頁縮圖 |
| 比對方法 | ImageMagick 等寬正規化後切帶（band）並排目視；動態區（跑馬燈、carousel 當前頁）像素差排除，聚焦版面結構 |
| 資料來源 | 公開 GraphQL API 即時資料（10 筆 activities，含 null 欄位樣本） |

註：S4.1 基準截圖含 15px scrollbar（內容寬 1425/753/360），等寬縮放後產生約 1-3% 垂直漂移；帶狀比對時已將此縮放假影納入判讀，未計為差異。

## 一、重構回歸檢查（現況 vs S4.1 基準）

**結論：無版面回歸。** 頁面總高 1440 檔 4158px vs 基準 4152px（+6px，scrollbar 寬度差所致），逐帶結構全數對齊。

| Viewport | Navbar | Hero | 資料卡 | Carousel | Dive sites | Witness | Footer | 結論 |
|---|---|---|---|---|---|---|---|---|
| 1440×900 | 一致 | 一致 | 一致 | 一致（當前頁位置差異屬 autoplay 動態） | 一致 | 一致 | 一致 | 無回歸 |
| 768×1024 | 一致 | 一致 | 一致 | 一致 | 一致 | 一致 | 一致 | 無回歸 |
| 375×812 | 一致 | 一致 | 一致（欄位單欄堆疊同基準） | 一致 | 一致 | 一致 | 一致 | 無回歸 |

被點名的重構風險逐項檢核：

| 重構項 | 檢核結果 |
|---|---|
| Marquee words/repeat API 改動 | 三處大字（hero / dive-sites / witness）字級、顏色、位置與基準一致；捲動起始相位差屬動態內容 |
| Section padding 檔位移除 | 各 section 間距與基準逐帶對齊，總頁高差僅 scrollbar 假影 |
| SiteHeader 抽出 | Navbar 三 viewport 版型、按鈕群（EN / 喇叭 / MENU）與基準一致 |
| StoryViewer 拆分 | 卡片尺寸、dots、箭頭、footer 貼齊皆與基準一致；**惟滑鼠 click 行為存在回歸，見第三節 FAIL 項** |

## 二、設計稿對齊（現況 vs Figma）

**結論：三 viewport 版面結構與設計稿對齊，無新增結構性差異。**

| Section | 1440（高解析比對） | 768（低解析縮圖比對） | 375（低解析縮圖比對) |
|---|---|---|---|
| Navbar | 一致（logo mark、EN／喇叭／MENU 鈕群） | 一致 | 一致 |
| Hero（圓形海龜照＋Information 跑馬燈） | 一致 | 一致 | 一致 |
| 海龜資料卡 | 一致（tab 標題、欄位雙欄、左右臉照片） | 一致 | 一致（單欄堆疊） |
| Photo carousel | 一致（中央大圖＋兩側 peek、黑圓箭頭、長條 dots） | 一致（圖下控制列） | 一致 |
| Dive sites（黑底＋pin 卡） | 一致 | 一致 | 一致 |
| Witness story（黑卡＋白字跑馬燈） | 一致（卡片內容為 live API 資料，與設計稿 mock 文案不同屬預期） | 一致 | 一致（無側邊箭頭，符合設計稿） |
| Footer | 一致（contact／sponsor 排列、KEEP WALKING FUND logo） | 一致 | 一致 |

已知且既記錄的對齊疑義（`docs/design-questions.md`）不重列為 diff：字體替代（#4）、Pad/Mobile 縮圖 ±10% 量測不確定度（#8）、hero 海龜照鏡像（#12）、sponsor logo 重繪（#13）、日期格式（#15）、選單/footer email 不一致（#16，實測選單為 `info@gmail.com`、footer 為 `tstservice@gmail.com`，忠實依稿）。

## 三、互動行為勾稽

### Menu（4/4 PASS）

| 項目 | 結果 | 證據 |
|---|---|---|
| 開啟：內容/版型 | PASS | 5 個導覽項（中文小字＋英文大字；Desktop 橫排、Mobile 直排）、聯絡我們 `info@gmail.com`、追蹤我們 facebook/instagram；開啟時 `body.style.overflow = "hidden"` |
| Esc 關閉 | PASS | Esc 後 dialog count 0 |
| 再點 MENU 關閉 | PASS | 開→點 MENU→dialog count 0（menu 鈕 z-50 維持可點） |
| Tab focus trap 循環 | PASS | 8 個可聚焦元素；Tab 到末項後繞回首項、Shift+Tab 反向繞行，焦點全程在 dialog 內 |

### Photo carousel（6/6 PASS）

| 項目 | 結果 | 證據 |
|---|---|---|
| loop 循環 | PASS | 第 1 張按 prev → 第 6 張；第 6 張按 next → 第 1 張 |
| 當前放大 | PASS | 當前 slide `scale(1)`，鄰近 slide `scale(0.88)`（tween 實測值） |
| 非當前淡出 | PASS | 當前 `opacity 1`，鄰近 `opacity 0.55` |
| autoplay：載入自動播 / 互動暫停 / 閒置 6s 恢復 | PASS | 載入後 4s 節奏 0→1→2；點箭頭後 4.8s 內不前進（暫停）；閒置逾 6s 後恢復前進（10.8s、15.3s 兩點觀測連續推進） |
| 箭頭與 dots 聯動 | PASS | 箭頭換頁 `aria-current` 同步；點 dot 直接跳頁 |
| drag 手勢 | PASS | 滑鼠向左拖曳 ≥ 門檻 → 下一張 |

### Witness story viewer（5/5 PASS，其中 2 項修復後複驗通過）

| 項目 | 結果 | 證據 |
|---|---|---|
| dots 連動 | **FAIL→修復→PASS** | 修復前：點任一 dot `aria-current` 恆為 0（詳見第四節）；修復後：點第 4 顆 → index 3、內容切至 2024/09/16 |
| 箭頭換頁（loop） | PASS | 第 1 則按上一則 → 第 10 則（2024/04/13）；第 10 則按下一則 → 第 1 則 |
| swipe 手勢 | PASS | 向左滑 → 下一則、向右滑 → 上一則、垂直/斜向滑不換頁（修復後複驗仍通過） |
| 進場動畫 | PASS | 換頁後 slide 容器 `animationName: enter`、0.5s，方向類別（`slide-in-from-left/right-8`）隨換頁方向切換 |
| VIEW POST 開新分頁＋null 欄位不顯示 | **FAIL→修復→PASS** | 修復前滑鼠 click 無法送達 anchor（同根因）；修復後實點開啟新分頁至 API `post_link`，DOM `target="_blank" rel="noopener noreferrer"`；`post_link` 為 null 的第 3/5/7 則無 anchor 且動作列容器不渲染空殼；`description` 為 null 的第 4/10 則無 description chip |

### reduced-motion（3/3 PASS）

| 項目 | 結果 | 證據 |
|---|---|---|
| 跑馬燈停止 | PASS | `emulateMedia(reducedMotion: reduce)` 後 `.marquee-track` `animationName: none` |
| carousel autoplay 不啟動 | PASS | 載入後 5.2s index 停在 0 |
| story 進場動畫關閉 | PASS | 換頁後 slide `animationName: none`（`motion-reduce:animate-none`） |

## 四、發現與修復記錄

### 修復 1：story 卡內滑鼠 click 全數失效（dots 跳頁、VIEW POST 點不動）

- **症狀**（headed 實測，Chrome）：story viewer 的 progress dots 逐顆點擊，`aria-current` 恆停在第 1 則；VIEW POST 滑鼠 click 亦無法開啟連結。鍵盤操作與卡片外側箭頭不受影響。
- **根因**：S5 code review 修正（a680308「swipe 邊界」）在 `onPointerDown` 無條件 `setPointerCapture`。Pointer capture 生效期間 `pointerup` 重定向至卡片（article）本身，瀏覽器據 UI Events click retargeting 把後續 `click` 事件也派發到 article——卡內 button/anchor 的 React `onClick` 永遠收不到事件。`elementFromPoint` 證實點擊座標正確落在 dot 上，而 document 層 click listener 觀測到 `click.target === ARTICLE`。
- **為何 CI 綠但實際壞**：jsdom 未實作 Pointer Capture 與 click retargeting，unit test 只能 mock 驗證「有呼叫 setPointerCapture」，驗不到瀏覽器端的 click 改派行為——原測試甚至把錯誤行為（pointerdown 即 capture）固化為規格。
- **修復**（`components/story-viewer.tsx`）：capture 延後至 `onPointerMove` 水平位移達 `CAPTURE_SLOP_PX = 10` 才要求（拖曳意圖確立）；單純 click（位移 < 10px）不觸發 capture，事件正常送達 dots／anchor；拖曳中一旦 capture，拖出卡片邊界放開仍收得到 pointerup（原修正意圖保留）。`pointerup`/`pointercancel` 重置 capture 旗標。
- **測試同步**（`tests/components/story-viewer.test.tsx`）：改寫 capture 案例為新語意——pointerdown 不 capture、位移未達 slop 不 capture、達 slop 才 capture 且僅一次、capture 後拖出邊界仍完成換頁。
- **fix-verify 迭代**：第 1 輪定位（elementFromPoint＋document click 探針，證實 retargeting）→ 修復＋tsc/test 綠＋重 build 重啟 → 第 2 輪 headed 複驗：dots 跳頁、箭頭 loop、swipe 三向、VIEW POST 開新分頁、null 欄位全數通過。

### 檢核後排除的疑點

- **頁面總高差**：等寬縮放後基準比現況高 38-121px，追查為基準截圖含 15px scrollbar 的縮放假影，非 Section padding 移除回歸。
- **carousel 當前頁不同**：autoplay 動態所致，非回歸。

## 五、殘留 known-diff

無本輪新增的結構性 diff。既記錄的設計疑義維持原案不重複展開，索引：`docs/design-questions.md` #4（字體替代與字級校正）、#8（Pad/Mobile 縮圖 ±10%）、#12（hero 照片鏡像）、#13（sponsor logo 重繪）、#15（日期格式）、#16（email 不一致）、#17-19（WCAG 疑慮，忠實依稿並附提案）。

## 六、驗證品質門檻

| 項目 | 結果 |
|---|---|
| `pnpm build` | 綠（修復後重跑） |
| `npx tsc --noEmit` | 綠 |
| `pnpm test` | 綠（11 files / 84 tests，含改寫後 capture 案例） |
| headed 互動勾稽 | 18 項全 PASS（2 項修復後複驗通過） |
| 整頁截圖 | `verify-{1440,768,375}.png`（修復後重拍） |
