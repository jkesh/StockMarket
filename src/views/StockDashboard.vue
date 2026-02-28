<template>
  <div class="terminal-grid">
    <section class="tv-panel watchlist">
      <div class="panel-title">
        <span>自选列表 /market/snapshot</span>
        <el-button size="small" type="primary" @click="loadSnapshot" :loading="loadingSnapshot">刷新</el-button>
      </div>

      <el-table
        :data="stocks"
        height="calc(100vh - 165px)"
        @row-click="selectStock"
        highlight-current-row
      >
        <el-table-column prop="stock" label="代码" width="90" />
        <el-table-column prop="name" label="名称" width="110" />
        <el-table-column prop="price" label="最新" width="85" />
        <el-table-column label="涨跌幅">
          <template #default="{ row }">
            <span :class="Number(row.changePct) >= 0 ? 'up' : 'down'">{{ row.changePct }}%</span>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="tv-panel chart-board">
      <div class="panel-title">
        <div class="ticker-line">
          <span class="symbol">{{ selectedStock || '--' }}</span>
          <span class="price">{{ currentPrice }}</span>
          <span :class="Number(currentChange) >= 0 ? 'up' : 'down'">{{ currentChange }}%</span>
        </div>
        <div class="tools-row">
          <el-button-group>
            <el-button size="small">1D</el-button>
            <el-button size="small">1W</el-button>
            <el-button size="small">1M</el-button>
            <el-button size="small">1Y</el-button>
          </el-button-group>
          <el-tag type="info">K线历史 /market/kline/:stock</el-tag>
        </div>
      </div>

      <div v-loading="loadingKline">
        <KLineChart :data="klineData" :stock-code="selectedStock" />
      </div>
    </section>

    <section class="tv-panel market-depth">
      <div class="panel-title">
        <span>盘口深度</span>
        <el-tag type="danger" effect="dark">模拟</el-tag>
      </div>

      <div class="depth-box">
        <div v-for="n in 5" :key="`ask-${n}`" class="depth-row ask">
          <span>卖{{ 6 - n }}</span>
          <span>{{ askPrice(n) }}</span>
          <span>{{ 1000 + n * 200 }}</span>
        </div>
        <div class="mid-price">最新 {{ currentPrice }}</div>
        <div v-for="n in 5" :key="`bid-${n}`" class="depth-row bid">
          <span>买{{ n }}</span>
          <span>{{ bidPrice(n) }}</span>
          <span>{{ 900 + n * 180 }}</span>
        </div>
      </div>

      <div class="recent-box">
        <div class="recent-title">近期成交</div>
        <div v-for="item in recentTrades" :key="item.time" class="recent-row">
          <span>{{ item.time }}</span>
          <span>{{ item.price }}</span>
          <span :class="item.side === 'BUY' ? 'up' : 'down'">{{ item.side }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import KLineChart from '../components/KLineChart.vue'
import { fetchStockKline, fetchStockSnapshot } from '../api/market'

const stocks = ref([])
const selectedStock = ref('')
const selectedStockMeta = ref({ price: '-', changePct: '-' })
const klineData = ref([])
const loadingSnapshot = ref(false)
const loadingKline = ref(false)

const recentTrades = computed(() => {
  const latest = klineData.value.slice(-6)
  return latest
    .reverse()
    .map((item, index) => ({
      time: item.date?.slice(-8) || `14:2${index}:00`,
      price: Number(item.close || 0).toFixed(2),
      side: Number(item.close) >= Number(item.open) ? 'BUY' : 'SELL'
    }))
})

const currentPrice = computed(() => {
  if (klineData.value.length) {
    return Number(klineData.value[klineData.value.length - 1].close).toFixed(2)
  }
  return selectedStockMeta.value.price
})

const currentChange = computed(() => selectedStockMeta.value.changePct ?? '-')

const askPrice = (level) => (Number(currentPrice.value || 0) + level * 0.01).toFixed(2)
const bidPrice = (level) => (Number(currentPrice.value || 0) - level * 0.01).toFixed(2)

const toSnapshotRows = (payload) => {
  const list = payload?.data || payload || []
  if (!Array.isArray(list)) return []
  return list.map((item) => ({
    stock: item.stock || item.code,
    name: item.name || '未知',
    price: item.price ?? '-',
    changePct: item.changePct ?? item.change ?? '-'
  }))
}

const toKlineRows = (payload) => {
  const list = payload?.data || payload || []
  if (!Array.isArray(list)) return []
  return list
    .map((item) => ({
      date: item.date || item.time || item.ts,
      open: Number(item.open),
      close: Number(item.close),
      low: Number(item.low),
      high: Number(item.high),
      volume: Number(item.volume || item.vol || 0)
    }))
    .filter((item) => [item.open, item.close, item.low, item.high].every((v) => !Number.isNaN(v)))
}

const loadSnapshot = async () => {
  loadingSnapshot.value = true
  try {
    const res = await fetchStockSnapshot()
    stocks.value = toSnapshotRows(res)
    if (!selectedStock.value && stocks.value.length) {
      await selectStock(stocks.value[0])
    }
  } catch (error) {
    ElMessage.error(`股票列表加载失败: ${error.message}`)
  } finally {
    loadingSnapshot.value = false
  }
}

const selectStock = async (row) => {
  if (!row?.stock) return
  selectedStock.value = row.stock
  selectedStockMeta.value = { price: row.price, changePct: row.changePct }
  loadingKline.value = true
  try {
    const res = await fetchStockKline(row.stock)
    klineData.value = toKlineRows(res)
  } catch (error) {
    ElMessage.error(`K线加载失败: ${error.message}`)
  } finally {
    loadingKline.value = false
  }
}

onMounted(() => {
  loadSnapshot()
})
</script>

<style scoped>
.terminal-grid {
  display: grid;
  grid-template-columns: 330px 1fr 280px;
  gap: 14px;
  min-height: calc(100vh - 92px);
}

.watchlist,
.chart-board,
.market-depth {
  padding: 12px;
}

.ticker-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.symbol {
  font-size: 16px;
  font-weight: 700;
}

.price {
  font-size: 18px;
  font-weight: 700;
}

.tools-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.depth-box {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
}

.depth-row {
  display: grid;
  grid-template-columns: 48px 1fr 1fr;
  padding: 8px 10px;
  font-size: 13px;
}

.depth-row.ask {
  background: rgba(255, 77, 79, 0.08);
}

.depth-row.bid {
  background: rgba(0, 192, 118, 0.08);
}

.mid-price {
  padding: 8px 10px;
  text-align: center;
  font-weight: 700;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.recent-title {
  color: var(--text-subtle);
  font-size: 13px;
  margin-bottom: 8px;
}

.recent-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(147, 164, 195, 0.2);
}

:deep(.el-table) {
  background: transparent;
}

:deep(.el-table tr),
:deep(.el-table th.el-table__cell),
:deep(.el-table td.el-table__cell) {
  background: transparent;
}

:deep(.el-table__row.current-row > td.el-table__cell) {
  background: rgba(41, 98, 255, 0.16) !important;
}

@media (max-width: 1380px) {
  .terminal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
