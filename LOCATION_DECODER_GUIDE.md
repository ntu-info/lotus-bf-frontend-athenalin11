# Location Decoder Feature 🧠

## 功能概述

實現了反向座標查詢功能：輸入或選擇 brain location (腦部座標)，系統會自動搜尋與該位置相關的 terms (功能關鍵詞)。

## 使用方式

### 1. 導航到 Brain Locations 頁面
點擊頂部導航的 "Brain Locations" 標籤

### 2. 使用 Location Decoder 工具
頁面頂部會看到 "Reverse Location Lookup" 區域

### 3. 輸入座標的三種方法：

#### 方法 A: 手動輸入座標
- **X (Left/Right)**: 左右方向 (-90 到 +90)
- **Y (Post/Ant)**: 前後方向 (-126 到 +90)
- **Z (Inf/Sup)**: 上下方向 (-72 到 +108)

#### 方法 B: 使用預設腦區
點擊任一預設腦區按鈕，系統會自動填入座標：
- **Amygdala (L/R)** - 杏仁核（情緒處理）
- **Hippocampus (L)** - 海馬體（記憶形成）
- **Visual Cortex** - 視覺皮層（視覺處理）
- **Motor Cortex** - 運動皮層（運動控制）
- **Prefrontal (L)** - 前額葉（決策制定）
- **Broca's Area** - 布洛卡區（語言產生）
- **Wernicke's Area** - 韋尼克區（語言理解）

#### 方法 C: 從下方座標表格選擇
執行搜尋後，下方會顯示該 term 的所有座標點，可以從表格中複製座標

### 4. 執行搜尋
點擊 "Find Terms" 按鈕，系統會：
- 檢查前 100 個 terms（可在代碼中調整）
- 找出在該座標 10mm 半徑內有激活數據的 terms
- 顯示進度：每檢查 10 個 terms 更新一次

### 5. 查看結果
- 顯示找到的 terms 數量和座標
- 每個 term 旁邊有 "Use Term" 按鈕
- 點擊後會自動填入搜尋欄位，可立即查看該 term 的研究數據

## 技術實現

### 算法邏輯
```javascript
1. 獲取所有可用 terms (從 /terms API)
2. 對每個 term 查詢其 locations (從 /query/{term}/locations API)
3. 計算每個 location 與目標座標的歐氏距離
4. 如果距離 ≤ 10mm，標記該 term 為匹配
5. 返回所有匹配的 terms
```

### 性能優化
- **限制檢查數量**: 默認只檢查前 100 個 terms
- **超時機制**: 每個 API 請求 3 秒超時
- **進度顯示**: 每 10 個 terms 更新一次進度
- **錯誤處理**: 單個 term 查詢失敗不影響整體流程

### 搜尋半徑
- **默認**: 10mm (可在代碼中調整)
- **原理**: 腦部激活區域通常有一定範圍，10mm 是合理的匹配半徑

## UI 設計特點

### Dark Sci-Fi Medical Lab 風格
- **顏色方案**: 黑色背景 + 青色（Cyan）高亮
- **動畫效果**: 
  - 載入時的滑動進度條
  - 按鈕 hover 時的發光效果
  - 結果卡片的浮動動畫
- **圖標**: SVG 圖標（搜尋、位置、文檔、箭頭）

### 響應式設計
- **桌面版**: 3 欄輸入框 + 多欄預設按鈕網格
- **平板**: 自動調整為合適寬度
- **手機**: 單欄布局，按鈕全寬

## 使用場景

### 研究應用
1. **已知腦區，尋找相關功能**
   - 例：在 Amygdala 座標附近可能找到 "fear", "emotion", "anxiety" 等 terms

2. **從實驗數據反查**
   - 如果你的 fMRI 實驗在某座標有激活，可以查詢該位置相關的認知功能

3. **腦區功能驗證**
   - 確認特定座標是否與預期的認知功能相關

### 教學應用
- 學習腦部座標系統（MNI 空間）
- 了解不同腦區的功能分布
- 探索腦功能定位的研究方法

## 限制與未來改進

### 當前限制
1. **API 限制**: 沒有專用的 `/decode` 端點，需要逐個查詢 terms
2. **性能**: 檢查 100 個 terms 可能需要 30-60 秒
3. **覆蓋率**: 只檢查部分 terms，可能遺漏一些匹配項

### 建議改進
1. **後端支持**: 
   ```
   POST /decode
   Body: { x: -24, y: -4, z: -18, radius: 10 }
   Response: { terms: ["emotion", "fear", ...] }
   ```

2. **智能採樣**: 優先檢查高頻 terms

3. **緩存機制**: 將座標-terms 映射關係緩存

4. **並行請求**: 使用 Promise.all 同時查詢多個 terms

5. **可調參數**: 讓用戶調整搜尋半徑和檢查數量

## 代碼文件

- **組件**: `src/components/LocationDecoder.jsx`
- **樣式**: `src/components/LocationDecoder.css`
- **集成**: `src/App.jsx` (已整合到 Brain Locations 頁面)

## 示例查詢

### Amygdala (杏仁核)
```
座標: (-24, -4, -18)
預期 terms: emotion, fear, anxiety, reward
功能: 情緒處理，特別是恐懼和獎勵相關
```

### Visual Cortex (視覺皮層)
```
座標: (0, -90, 0)
預期 terms: vision, visual, perception, attention
功能: 視覺信息處理
```

### Motor Cortex (運動皮層)
```
座標: (-42, -22, 58)
預期 terms: motor, movement, action, hand
功能: 運動控制和執行
```

---

**Note**: 由於這是反向查詢（從座標找 terms），而不是正向查詢（從 term 找座標），所以需要較長的計算時間。建議使用預設腦區來快速體驗功能！
