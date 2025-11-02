# 🔧 Query Builder 更新說明

## ✅ 完成的修改

### 1️⃣ **功能位置修正**
- ✅ **Terms 頁面**：只顯示關鍵字列表
- ✅ **Studies 頁面**：包含 Query Builder + Research Studies（恢復原位）
- ✅ **Locations 頁面**：顯示 NiiViewer 腦部視覺化

### 2️⃣ **全新長條型搜尋框**
```
┌────────────────────────────────────────────────────┬──────────┐
│  Enter search query...                             │  Search  │
└────────────────────────────────────────────────────┴──────────┘
```

#### 特點：
- 📏 **長條型設計**：輸入框佔據主要空間
- 🔍 **Search 按鈕**：位於右側，帶圖標
- 🎨 **科技藍紫風格**：符合整體配色
- 📱 **響應式**：手機上變為垂直排列

### 3️⃣ **AJAX 載入效果**
```javascript
// 點擊 Search 按鈕時
isSearching = true
↓
顯示旋轉動畫 ⚪ Searching...
↓
300ms 後完成
↓
isSearching = false
```

#### 載入動畫：
- 🔄 **旋轉 Spinner**：藍色圓圈旋轉
- ⏳ **按鈕文字改變**：Search → Searching...
- 🚫 **禁用狀態**：載入時無法再次點擊

### 4️⃣ **操作符按鈕區域**
- 🎯 半透明背景容器
- 📦 包含：AND, OR, NOT, (, ), Clear
- 💫 懸停時發光效果

### 5️⃣ **當前查詢顯示**
```
Current Query: [memory AND emotion]
```
- 只在有查詢內容時顯示
- 使用等寬字體（monospace）
- 藍色背景容器

---

## 🎨 視覺特效

### 搜尋框
- 深色半透明背景
- 藍色邊框
- 聚焦時發光效果
- 內陰影增加深度

### Search 按鈕
- 藍紫漸變背景
- 懸停時：掃光動畫 + 上浮
- 點擊時：下壓反饋
- 載入時：旋轉動畫

### 響應式斷點
```css
手機 (< 768px):     垂直排列，全寬按鈕
平板 (768-1023px):  稍微調整 padding
桌面 (≥ 1024px):    水平長條，固定按鈕寬度
```

---

## 📊 使用方式

### 1. **輸入查詢**
```
在長條型輸入框中輸入搜尋條件
例如：memory AND emotion
```

### 2. **按 Enter 或點擊 Search**
```
按下 Enter 鍵
或
點擊 Search 按鈕
↓
觸發 AJAX 載入動畫
↓
完成搜尋
```

### 3. **使用快速操作符**
```
點擊 AND / OR / NOT 按鈕
自動附加到查詢字串後面
```

### 4. **清除查詢**
```
點擊 Clear 按鈕
清空所有內容
```

---

## 🚀 測試步驟

1. **刷新瀏覽器** http://localhost:5174/
2. **切換到 Research Studies 頁面**
3. **查看新的長條型搜尋框**
4. **輸入查詢並點擊 Search**
5. **觀察載入動畫效果**

---

## 🎯 技術細節

### 狀態管理
```javascript
const [isSearching, setIsSearching] = useState(false);
```

### AJAX 模擬
```javascript
const handleSearch = async () => {
  setIsSearching(true);
  await new Promise(resolve => setTimeout(resolve, 300));
  setIsSearching(false);
};
```

### SVG 圖標
```jsx
<svg viewBox="0 0 20 20" fill="currentColor">
  <path d="..." /> // 放大鏡圖標
</svg>
```

---

## ✨ 完成狀態

✅ Query Builder 移到 Studies 頁面  
✅ 長條型搜尋框設計  
✅ Search 按鈕在右側  
✅ AJAX 載入動畫  
✅ 旋轉 Spinner 效果  
✅ 響應式設計  
✅ 科技藍紫配色  
✅ 懸停光效  

現在打開瀏覽器，切換到 **Research Studies** 頁面查看全新的搜尋介面！🎉
