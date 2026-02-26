<template>
  <el-row :gutter="20">
    <el-col :span="10">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>股票列表（/market/snapshot）</span>
            <el-button type="primary" @click="loadSnapshot" :loading="loadingSnapshot">刷新</el-button>
          </div>
        </template>
        <el-table :data="stocks" stripe height="520" @row-click="selectStock">
          <el-table-column prop="stock" label="代码" width="120" />
          <el-table-column prop="name" label="名称" width="140" />
          <el-table-column prop="price" label="最新价" />
          <el-table-column prop="changePct" label="涨跌幅(%)" />
        </el-table>
      </el-card>
    </el-col>

    <el-col :span="14">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>K线历史（/market/kline/:stock）</span>
            <el-tag v-if="selectedStock" type="success">当前: {{ selectedStock }}</el-tag>
          </div>
        </template>
        <div v-loading="loadingKline">
          <KLineChart :data="klineData" :stock-code="selectedStock" />
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import KLineChart from '../components/KLineChart.vue'
import { fetchStockKline, fetchStockSnapshot } from '../api/market'

const stocks = ref([])
const selectedStock = ref('')
const klineData = ref([])
const loadingSnapshot = ref(false)
const loadingKline = ref(false)

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
  return list.map((item) => ({
    date: item.date || item.time || item.ts,
    open: Number(item.open),
    close: Number(item.close),
    low: Number(item.low),
    high: Number(item.high),
    volume: Number(item.volume || item.vol || 0)
  }))
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
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
