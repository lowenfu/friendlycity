const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 提供靜態文件
app.use(express.static(__dirname));

// 資料儲存（實際應用中應使用資料庫）
let places = [
    {
        "id": 1,
        "名稱": "全家牛排館",
        "年度": "103",
        "分類": "餐飲",
        "電話": "076222344",
        "地址": "高雄市岡山區大德一路26號",
        "區域": "岡山區",
        "網址連結": "https://example.com/quanjia",
        "友善特色": "1.無障礙入口\n2.無障礙廁所",
        "圖片": "",
        "最後修改時間": "2025-02-01T10:30:00"
    },
    {
        "id": 2,
        "名稱": "人从众厚切牛排- 鳳山文濱店",
        "年度": "112",
        "分類": "餐飲",
        "電話": "07 7775718",
        "地址": "高雄市鳳山區文濱路130號",
        "區域": "鳳山區",
        "網址連結": "https://example.com/rencongzhong",
        "友善特色": "1.無障礙入口\n2.無障礙廁所",
        "圖片": "",
        "最後修改時間": "2025-01-02T14:20:00"
    },
    {
        "id": 3,
        "名稱": "泮咖啡",
        "年度": "113",
        "分類": "餐飲",
        "電話": "07 585 6868",
        "地址": "高雄市左營區蓮潭路176號",
        "區域": "左營區",
        "網址連結": "https://example.com/pan-coffee",
        "友善特色": "1.大門為前後推拉門，常保開啟狀態\n2.出入口有兩格階梯，大門左側設有斜坡道，坡道長度約4公尺，坡度約15~25度輪椅使用者不需有人協助\n3.商家歡迎導盲犬進入\n4.主要通道輪椅使用者可雙向通行\n5.桌下有足夠容膝空間，且椅子有靠背，輪椅使用者可自行調整至方便用餐空間\n6.商家有設置友善充電座、友善優先席及兒童座椅，供行動不便者跟兒童使用",
        "圖片": "",
        "最後修改時間": "2025-01-03T09:15:00"
    }
];

let nextId = 4;

// API Routes

// 根路徑 - 顯示 API 資訊
app.get('/', (req, res) => {
    res.json({
        message: '友善營業場所 API',
        version: '1.0.0',
        endpoints: {
            '取得所有場所': 'GET /api/places',
            '取得單一場所': 'GET /api/places/:id',
            '新增場所': 'POST /api/places',
            '更新場所': 'PUT /api/places/:id',
            '刪除場所': 'DELETE /api/places/:id',
            '健康檢查': 'GET /api/health'
        },
        queryParams: {
            category: '分類篩選 (餐飲/零售/服務等)',
            area: '區域篩選 (岡山區/鳳山區等)',
            year: '年度篩選',
            search: '關鍵字搜尋 (名稱/地址/區域)'
        }
    });
});

// 取得所有場所（支援查詢參數）
app.get('/api/places', (req, res) => {
    try {
        let result = [...places];
        
        // 篩選條件
        const { category, area, year, search } = req.query;
        
        if (category) {
            result = result.filter(p => p.分類 === category);
        }
        
        if (area) {
            result = result.filter(p => p.區域 === area);
        }
        
        if (year) {
            result = result.filter(p => p.年度 === year);
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(p => 
                p.名稱.toLowerCase().includes(searchLower) ||
                p.地址.toLowerCase().includes(searchLower) ||
                p.區域.toLowerCase().includes(searchLower)
            );
        }
        
        // 依最後修改時間排序（最近的在前）
        result.sort((a, b) => {
            return new Date(b.最後修改時間) - new Date(a.最後修改時間);
        });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: '伺服器錯誤', message: error.message });
    }
});

// 取得單一場所
app.get('/api/places/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const place = places.find(p => p.id === id);
        
        if (!place) {
            return res.status(404).json({ error: '找不到該場所' });
        }
        
        res.json(place);
    } catch (error) {
        res.status(500).json({ error: '伺服器錯誤', message: error.message });
    }
});

// 新增場所
app.post('/api/places', (req, res) => {
    try {
        const newPlace = {
            id: nextId++,
            名稱: req.body.名稱 || '',
            年度: req.body.年度 || '',
            分類: req.body.分類 || '',
            電話: req.body.電話 || '',
            地址: req.body.地址 || '',
            區域: req.body.區域 || '',
            網址連結: req.body.網址連結 || '',
            友善特色: req.body.友善特色 || '',
            圖片: req.body.圖片 || '',
            最後修改時間: new Date().toISOString()
        };
        
        // 驗證必填欄位
        if (!newPlace.名稱 || !newPlace.分類 || !newPlace.地址 || !newPlace.區域) {
            return res.status(400).json({ error: '缺少必填欄位' });
        }
        
        places.push(newPlace);
        
        res.status(201).json({
            message: '新增成功',
            data: newPlace
        });
    } catch (error) {
        res.status(500).json({ error: '伺服器錯誤', message: error.message });
    }
});

// 更新場所
app.put('/api/places/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = places.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: '找不到該場所' });
        }
        
        // 保留 id，更新其他欄位
        const updatedPlace = {
            id: id,
            名稱: req.body.名稱 || places[index].名稱,
            年度: req.body.年度 || places[index].年度,
            分類: req.body.分類 || places[index].分類,
            電話: req.body.電話 !== undefined ? req.body.電話 : places[index].電話,
            地址: req.body.地址 || places[index].地址,
            區域: req.body.區域 || places[index].區域,
            網址連結: req.body.網址連結 !== undefined ? req.body.網址連結 : places[index].網址連結,
            友善特色: req.body.友善特色 !== undefined ? req.body.友善特色 : places[index].友善特色,
            圖片: req.body.圖片 !== undefined ? req.body.圖片 : places[index].圖片,
            最後修改時間: new Date().toISOString()
        };
        
        places[index] = updatedPlace;
        
        res.json({
            message: '更新成功',
            data: updatedPlace
        });
    } catch (error) {
        res.status(500).json({ error: '伺服器錯誤', message: error.message });
    }
});

// 刪除場所
app.delete('/api/places/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const index = places.findIndex(p => p.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: '找不到該場所' });
        }
        
        const deletedPlace = places.splice(index, 1)[0];
        
        res.json({
            message: '刪除成功',
            data: deletedPlace
        });
    } catch (error) {
        res.status(500).json({ error: '伺服器錯誤', message: error.message });
    }
});

// 取得統計資料
app.get('/api/statistics', (req, res) => {
    try {
        const stats = {
            total: places.length,
            byCategory: {},
            byArea: {},
            byYear: {}
        };
        
        places.forEach(place => {
            // 按分類統計
            stats.byCategory[place.分類] = (stats.byCategory[place.分類] || 0) + 1;
            
            // 按區域統計
            stats.byArea[place.區域] = (stats.byArea[place.區域] || 0) + 1;
            
            // 按年度統計
            stats.byYear[place.年度] = (stats.byYear[place.年度] || 0) + 1;
        });
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: '伺服器錯誤', message: error.message });
    }
});

// 健康檢查
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: '伺服器運作正常'
    });
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({ error: '找不到該路由' });
});

// 錯誤處理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '伺服器錯誤', message: err.message });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
    console.log(`📍 API 端點: http://localhost:${PORT}/api/places`);
    console.log(`💚 健康檢查: http://localhost:${PORT}/api/health`);
});

// 匯出 app 供測試使用
module.exports = app;
