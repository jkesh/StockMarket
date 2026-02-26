# 模拟盘交易前端（Vue + Vite）

## 技术栈
- Vue 3 + Vite
- Vue Router
- Element Plus
- ECharts
- Axios

## 功能概览
- 股票总览：拉取 `/market/snapshot` 展示股票列表与最新价。
- 历史行情：按股票代码拉取 `/market/kline/:stock` 并展示 K 线图与成交量。
- 模拟交易：调用 `/trade/match` 做成交撮合校验。
- 盈亏查询：调用 `/trade/profit/:id` 查看指定交易盈亏。

## 运行
```bash
npm install
npm run dev
```

## 环境变量
可通过 `.env` 设置后端地址：

```bash
VITE_API_BASE_URL=http://localhost:8080
```
