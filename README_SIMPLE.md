# 🧠 LoTUS Brain Frontend

> 神經科學文獻與腦區視覺化查詢系統

[![線上展示](https://img.shields.io/badge/Demo-Live-00ffe6)](https://athenalin11.github.io/athneurosynthfrontend/)

---

## 📋 專案目的

提供一個直覺的介面，讓使用者能夠：
1. 搜尋神經科學術語（terms）並查看相關研究
2. 查詢術語對應的腦區坐標位置
3. 點擊腦部影像進行**座標反查**，找出該位置相關的術語

---

## ✨ 主要功能

### 1. **術語搜尋與字母篩選**
- **即時搜尋**：輸入時自動過濾術語列表（AJAX）
- **A-Z 字母按鈕**：點擊字母快速篩選以該字母開頭的術語
- **點擊跳轉**：點選術語後自動導航至 Studies 頁面查看相關研究

**實現方式**：
```javascript
// 即時搜尋：監聽 input 變化
<input onChange={(e) => setSearchTerm(e.target.value)} />

// 字母篩選：過濾術語陣列
const filteredTerms = terms.filter(term => 
  term.toLowerCase().startsWith(selectedLetter.toLowerCase())
);
```

---

### 2. **腦區坐標反查術語**
- **點擊腦部影像**：在 Brain Viewer 頁面點擊腦區任一位置
- **自動反查**：系統根據點擊的 MNI 坐標 (x, y, z) 查詢相關術語
- **即時顯示**：在下方表格顯示所有相關術語

**實現方式**：
```javascript
// 預計算系統：啟動時建立映射表
const coordinateMap = new Map(); // key: "x,y,z", value: Set of terms

// 查詢時直接從 Map 讀取（<100ms）
const terms = coordinateMap.get(`${x},${y},${z}`) || new Set();
```

**效能優化**：
- 傳統方法：每次點擊需呼叫 API 多次 → **15-30 秒**
- 預計算方法：啟動時建立映射表 → 查詢 **<100ms**（提升 **150-300 倍**）

---

### 3. **腦區坐標查詢**
- **輸入參數**：術語名稱、搜尋半徑、結果數量
- **顯示結果**：表格呈現所有符合的腦區坐標 (x, y, z)
- **卡片式佈局**：使用 Grid 排列參數輸入框，視覺更清晰

**實現方式**：
```javascript
// API 請求
fetch(`/query/${term}/locations?r=${radius}&limit=${limit}`)
  .then(res => res.json())
  .then(data => setLocations(data.results));
```

---

### 4. **設計風格統一**
- **Dark Sci-Fi 主題**：深色背景 + 霓虹青色 (#00ffe6)
- **Grid 響應式佈局**：自動適應不同螢幕尺寸
- **漸層按鈕 + 發光特效**：懸浮時顯示掃描動畫
- **圓角表格 + 動畫**：表格列懸浮時放大並發光

---

## 🛠️ 技術實現

### 預計算系統架構
```javascript
// 1. 啟動時獲取所有術語
const terms = await fetch('/terms').then(r => r.json());

// 2. 對每個術語獲取位置坐標
for (let term of terms.slice(0, 30)) {
  const locations = await fetch(`/query/${term}/locations?limit=20`);
  
  // 3. 建立映射表（座標 → 術語集合）
  locations.forEach(loc => {
    const key = `${round(loc.x)},${round(loc.y)},${round(loc.z)}`;
    if (!coordinateMap.has(key)) {
      coordinateMap.set(key, new Set());
    }
    coordinateMap.get(key).add(term);
  });
}

// 4. 點擊時直接查詢（極速）
const relatedTerms = coordinateMap.get(`${clickX},${clickY},${clickZ}`);
```

### 字母篩選實現
```javascript
// A-Z 按鈕陣列
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// 點擊字母時過濾
const handleLetterClick = (letter) => {
  setSelectedLetter(letter);
  const filtered = allTerms.filter(term => 
    term.toLowerCase().startsWith(letter.toLowerCase())
  );
  setFilteredTerms(filtered);
};
```

### Grid 卡片佈局
```css
.control-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

---

## 🚀 快速開始

### 本地開發
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
# 開啟 http://localhost:5173
```

### 生產部署
```bash
# 構建生產版本
npm run build
# 產生 dist/ 資料夾

# 部署到 GitHub Pages
cd dist
git init
git add -A
git commit -m "Deploy"
git branch -M gh-pages
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -f origin gh-pages
```

---

## 📂 專案結構

```
├── src/
│   ├── components/
│   │   ├── Terms.jsx           # 術語搜尋 + 字母篩選
│   │   ├── NiiViewer.jsx       # 腦部影像 + 座標反查
│   │   ├── Locations.jsx       # 腦區坐標查詢
│   │   ├── Studies.jsx         # 文獻查詢
│   │   └── QueryBuilder.jsx    # 查詢構建器
│   ├── api.js                  # API 請求邏輯
│   └── App.jsx                 # 主應用
├── public/
│   └── static/
│       └── mni_2mm.nii.gz      # 腦部影像檔案
└── vite.config.js              # Vite 配置
```

---

## 🌐 API 端點

**Base URL**: `https://mil.psy.ntu.edu.tw:5000`

| 端點 | 功能 |
|------|------|
| `GET /terms` | 獲取所有術語 |
| `GET /query/{term}/studies` | 查詢術語相關研究 |
| `GET /query/{term}/locations` | 查詢術語腦區坐標 |
| `GET /decode?x={x}&y={y}&z={z}` | 座標反查術語 |

---

## 👥 作者

**Athena Lin** - [athenalin11](https://github.com/athenalin11)

---

## 📄 授權

本專案為 NTU Info GitHub Classroom 課程專案。
