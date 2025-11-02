# Crosshair Position 整合反向查詢功能 ✨

## 改進概述

根據用戶反饋，我們將反向座標查詢功能整合到了 **Crosshair Position** 控制區，提升了用戶體驗。現在用戶可以：

1. ✅ 調整綠色十字標記（crosshair）的位置
2. ✅ 同時查看該位置相關的 brain function terms
3. ✅ 一切都在同一個控制面板內完成

## 改動說明

### 移除的組件
- ❌ 獨立的 `LocationDecoder` 組件（單獨顯示在頁面頂部）
- ❌ `LocationDecoder.jsx` 和 `LocationDecoder.css`（保留作為參考）

### 整合的功能
現在在 **NiiViewer** 組件的 **Crosshair Position** 區域：

#### 1. 原有功能（保持不變）
- 點擊腦圖來移動綠色十字標記
- 手動輸入 X, Y, Z 座標
- 座標即時更新到三個視圖（Coronal, Sagittal, Axial）

#### 2. 新增功能
- **"Find Related Terms" 按鈕**
  - 點擊後自動搜尋當前座標附近的相關 terms
  - 搜尋範圍：10mm 半徑
  - 檢查數量：前 100 個 terms
  
- **結果顯示卡片**
  - 搜尋進度動畫
  - 成功時顯示找到的 terms 列表
  - 失敗時顯示友善的錯誤訊息
  - 可關閉的結果面板

## 使用流程

### 方法 1: 點擊圖片 + 查詢
1. 進入 **Brain Locations** 頁面
2. 在搜尋欄輸入 term（例如："emotion"）
3. 點擊任一腦圖上的感興趣位置
4. 座標自動更新到 Crosshair Position
5. 點擊 **"Find Related Terms"** 按鈕
6. 查看該位置相關的其他 terms

### 方法 2: 手動輸入座標 + 查詢
1. 進入 **Brain Locations** 頁面
2. 在 Crosshair Position 區域輸入座標
   - 例如：X = -24, Y = -4, Z = -18 (左側杏仁核)
3. 點擊 **"Find Related Terms"** 按鈕
4. 查看結果

### 方法 3: 從座標表格選擇
1. 先搜尋一個 term
2. 滾動到下方的 "Brain Region Coordinates" 表格
3. 找到感興趣的座標
4. 手動複製座標值到 Crosshair Position
5. 點擊 **"Find Related Terms"** 按鈕

## UI 設計特點

### 按鈕設計
- **正常狀態**: 青色漸變背景 + 發光效果
- **Hover 狀態**: 上浮動畫 + 增強發光
- **載入狀態**: 旋轉動畫 + 半透明背景
- **全寬設計**: 方便點擊

### 結果卡片
- **成功狀態**:
  - 青色邊框（2px）
  - 發光效果
  - 顯示找到的 terms 數量和座標
  - 可滾動的 terms 列表（最高 200px）
  
- **載入狀態**:
  - 滑動進度條動畫
  - 說明文字

- **錯誤狀態**:
  - 警告圖標
  - 紅色文字
  - 友善的錯誤訊息

- **關閉按鈕**: 
  - 右上角 × 按鈕
  - Hover 時變成青色

### Terms 列表
- 每個 term 一個卡片
- Hover 時：
  - 背景變亮
  - 邊框變成青色
  - 向右滑動 4px
- 暗色背景 + 青色邊框

## 技術實現

### 狀態管理
```javascript
const [decodingTerms, setDecodingTerms] = useState(false)     // 是否正在搜尋
const [decodedTerms, setDecodedTerms] = useState([])          // 找到的 terms
const [decodeError, setDecodeError] = useState('')            // 錯誤訊息
const [showDecodeResults, setShowDecodeResults] = useState(false) // 是否顯示結果
```

### 搜尋函數
```javascript
const handleDecodePosition = async () => {
  // 1. 取得當前座標 (cx, cy, cz)
  // 2. Fetch 所有 terms
  // 3. 對每個 term 查詢其 locations
  // 4. 計算歐氏距離
  // 5. 距離 ≤ 10mm 則匹配
  // 6. 返回所有匹配的 terms
}
```

### 性能優化
- 只檢查前 100 個 terms
- 每個 API 請求 3 秒超時
- 使用 `AbortSignal.timeout(3000)`
- 錯誤自動跳過，不中斷整體流程

### CSS 動畫
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes loadingSlide {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 優勢對比

### 之前（分開兩個組件）
❌ LocationDecoder 在頁面頂部
❌ Crosshair Position 在中間
❌ 用戶需要在兩個地方輸入座標
❌ 無法直接從 crosshair 位置查詢
❌ 體驗不連貫

### 現在（整合設計）
✅ 所有功能在一個控制面板
✅ 點擊圖片 → 座標更新 → 一鍵查詢
✅ 流程順暢直觀
✅ 減少重複操作
✅ 更符合用戶心智模型

## 使用案例

### 案例 1: 探索情緒相關腦區
```
1. 搜尋 "emotion"
2. 查看腦圖上的紅色激活區
3. 點擊最亮的區域（通常是杏仁核）
4. 座標更新為：X=-24, Y=-4, Z=-18
5. 點擊 "Find Related Terms"
6. 發現相關 terms: fear, anxiety, reward, threat
```

### 案例 2: 驗證文獻中的座標
```
1. 從論文中看到座標：X=42, Y=-22, Z=58
2. 在 Crosshair Position 輸入這些值
3. 腦圖自動跳到該位置
4. 點擊 "Find Related Terms"
5. 確認該位置確實與 motor, movement, hand 相關
```

### 案例 3: 比較不同區域的功能
```
1. 輸入前額葉座標：X=-40, Y=46, Z=4
2. 查詢得到：decision, executive, working memory
3. 輸入枕葉座標：X=0, Y=-90, Z=0
4. 查詢得到：vision, visual, perception
5. 了解不同腦區的功能差異
```

## 注意事項

### 搜尋時間
- 檢查 100 個 terms 大約需要 **30-60 秒**
- 請耐心等待搜尋完成
- 可以在載入時看到進度提示

### 搜尋範圍
- 半徑：**10mm**（符合腦科學研究慣例）
- 檢查數量：**前 100 個 terms**（平衡速度與準確性）
- 未來可以加入自定義半徑功能

### API 限制
- 沒有專用的反向查詢 API
- 需要逐個查詢 terms 的 locations
- 建議後端團隊開發 `/decode` 端點以提升性能

## 文件變更

### 修改的文件
- ✏️ `src/components/NiiViewer.jsx` - 添加反向查詢功能
- ✏️ `src/components/NiiViewer.css` - 添加動畫
- ✏️ `src/App.jsx` - 移除 LocationDecoder import

### 保留的文件（作為參考）
- 📁 `src/components/LocationDecoder.jsx`
- 📁 `src/components/LocationDecoder.css`
- 📁 `LOCATION_DECODER_GUIDE.md`

## 未來改進方向

### 短期改進
1. 添加預設腦區快速按鈕（Amygdala, Visual Cortex 等）
2. 顯示搜尋進度百分比
3. 可調整搜尋半徑（5mm, 10mm, 15mm）

### 中期改進
1. Terms 結果可點擊直接搜尋
2. 顯示每個 term 的距離
3. 按距離排序結果

### 長期改進
1. 後端開發 `/decode` API 端點
2. 預先計算座標-terms 映射關係
3. 支援批量座標查詢
4. 3D 熱力圖顯示 term 分布

---

## 總結

這次整合大幅提升了用戶體驗：
- ✅ 功能集中，操作流暢
- ✅ 視覺一致，設計統一
- ✅ 減少重複，提高效率
- ✅ 符合直覺，易於理解

現在用戶可以在調整 crosshair 的同時，直接探索該位置的腦功能，真正實現了「所見即所得」的交互體驗！🎉
