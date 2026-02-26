<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <span>模拟交易（/trade/match）</span>
        </template>

        <el-form :model="tradeForm" label-width="100px">
          <el-form-item label="股票代码">
            <el-input v-model="tradeForm.stock" placeholder="例如：600519" />
          </el-form-item>
          <el-form-item label="方向">
            <el-select v-model="tradeForm.side" style="width: 100%">
              <el-option label="买入" value="BUY" />
              <el-option label="卖出" value="SELL" />
            </el-select>
          </el-form-item>
          <el-form-item label="委托价格">
            <el-input-number v-model="tradeForm.price" :precision="2" :min="0.01" :step="0.01" style="width: 100%" />
          </el-form-item>
          <el-form-item label="委托数量">
            <el-input-number v-model="tradeForm.quantity" :min="1" :step="100" style="width: 100%" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleMatch" :loading="loadingMatch">成交校验</el-button>
          </el-form-item>
        </el-form>

        <el-alert
          v-if="matchResult"
          title="成交结果"
          type="success"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>交易ID: {{ matchResult.tradeId || '-' }}</p>
            <p>是否成交: {{ matchResult.matched ? '是' : '否' }}</p>
            <p>成交均价: {{ matchResult.avgPrice ?? '-' }}</p>
            <p>成交数量: {{ matchResult.filledQty ?? '-' }}</p>
          </template>
        </el-alert>
      </el-card>
    </el-col>

    <el-col :span="12">
      <el-card>
        <template #header>
          <span>交易盈亏（/trade/profit/:id）</span>
        </template>

        <el-form label-width="100px">
          <el-form-item label="交易ID">
            <el-input v-model="tradeId" placeholder="输入交易ID" />
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
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { fetchTradeProfit, matchTrade } from '../api/trade'

const loadingMatch = ref(false)
const loadingProfit = ref(false)
const tradeId = ref('')
const matchResult = ref(null)
const profitResult = ref(null)

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
