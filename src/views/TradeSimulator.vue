<template>
  <div class="trade-grid">
    <section class="tv-panel order-entry">
      <div class="panel-title">
        <span>下单面板 /trade/match</span>
        <el-tag type="success" effect="dark">Paper Trade</el-tag>
      </div>

      <el-form :model="tradeForm" label-position="top">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="股票代码">
              <el-input v-model="tradeForm.stock" placeholder="例如 600519" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="方向">
              <el-segmented v-model="tradeForm.side" :options="sideOptions" block />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="委托价格">
              <el-input-number v-model="tradeForm.price" :min="0.01" :step="0.01" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="委托数量">
              <el-input-number v-model="tradeForm.quantity" :min="100" :step="100" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button class="submit-btn" type="primary" @click="handleMatch" :loading="loadingMatch">提交成交校验</el-button>
        </el-form-item>
      </el-form>

      <el-alert v-if="matchResult" type="success" :closable="false" show-icon>
        <template #title>成交回执</template>
        <template #default>
          <div class="kv"><span>交易ID</span><span>{{ matchResult.tradeId || '-' }}</span></div>
          <div class="kv"><span>是否成交</span><span>{{ matchResult.matched ? '是' : '否' }}</span></div>
          <div class="kv"><span>成交均价</span><span>{{ matchResult.avgPrice ?? '-' }}</span></div>
          <div class="kv"><span>成交数量</span><span>{{ matchResult.filledQty ?? '-' }}</span></div>
        </template>
      </el-alert>
    </section>

    <section class="tv-panel pnl-panel">
      <div class="panel-title">
        <span>盈亏追踪 /trade/profit/:id</span>
      </div>

      <el-form label-position="top">
        <el-form-item label="交易ID">
          <el-input v-model="tradeId" placeholder="输入交易ID，或由上方回执自动填入" />
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="loadProfit" :loading="loadingProfit">查询盈亏</el-button>
        </el-form-item>
      </el-form>

      <el-descriptions v-if="profitResult" :column="1" border>
        <el-descriptions-item label="浮动盈亏">{{ profitResult.unrealizedPnl ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="已实现盈亏">{{ profitResult.realizedPnl ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="收益率(%)">{{ profitResult.roi ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ profitResult.updatedAt ?? '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="pnl-cards" v-if="profitResult">
        <div class="metric tv-panel-soft">
          <span>净值波动</span>
          <strong :class="Number(profitResult.unrealizedPnl) >= 0 ? 'up' : 'down'">
            {{ profitResult.unrealizedPnl ?? '-' }}
          </strong>
        </div>
        <div class="metric tv-panel-soft">
          <span>累计收益率</span>
          <strong :class="Number(profitResult.roi) >= 0 ? 'up' : 'down'">
            {{ profitResult.roi ?? '-' }}%
          </strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchTradeProfit, matchTrade } from '../api/trade'

const loadingMatch = ref(false)
const loadingProfit = ref(false)
const tradeId = ref('')
const matchResult = ref(null)
const profitResult = ref(null)

const sideOptions = [
  { label: '买入', value: 'BUY' },
  { label: '卖出', value: 'SELL' }
]

const tradeForm = reactive({
  stock: '',
  side: 'BUY',
  price: 10,
  quantity: 100
})

const handleMatch = async () => {
  loadingMatch.value = true
  try {
    const payload = {
      stock: tradeForm.stock,
      side: tradeForm.side,
      price: tradeForm.price,
      quantity: tradeForm.quantity
    }
    matchResult.value = await matchTrade(payload)
    if (matchResult.value?.tradeId) {
      tradeId.value = matchResult.value.tradeId
    }
    ElMessage.success('成交校验完成')
  } catch (error) {
    ElMessage.error(`成交校验失败: ${error.message}`)
  } finally {
    loadingMatch.value = false
  }
}

const loadProfit = async () => {
  if (!tradeId.value) {
    ElMessage.warning('请先输入交易ID')
    return
  }

  loadingProfit.value = true
  try {
    profitResult.value = await fetchTradeProfit(tradeId.value)
    ElMessage.success('盈亏查询完成')
  } catch (error) {
    ElMessage.error(`盈亏查询失败: ${error.message}`)
  } finally {
    loadingProfit.value = false
  }
}
</script>

<style scoped>
.trade-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 14px;
  min-height: calc(100vh - 92px);
}

.order-entry,
.pnl-panel {
  padding: 14px;
}

.submit-btn {
  width: 100%;
  height: 40px;
}

.kv {
  display: grid;
  grid-template-columns: 90px 1fr;
  padding: 5px 0;
}

.pnl-cards {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tv-panel-soft {
  border-radius: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  background: rgba(147, 164, 195, 0.08);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric span {
  color: var(--text-subtle);
  font-size: 12px;
}

.metric strong {
  font-size: 20px;
}

@media (max-width: 1200px) {
  .trade-grid {
    grid-template-columns: 1fr;
  }
}
</style>
