<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  stockCode: {
    type: String,
    default: ''
  }
})

const chartRef = ref(null)
let chartInstance = null

const option = computed(() => {
  const labels = props.data.map((item) => item.date)
  const klineData = props.data.map((item) => [item.open, item.close, item.low, item.high])
  const volumeData = props.data.map((item) => item.volume)

  return {
    backgroundColor: '#fff',
    animation: false,
    title: {
      text: props.stockCode ? `${props.stockCode} K线` : 'K线走势'
    },
    legend: {
      data: ['K线', '成交量']
    },
    tooltip: {
      trigger: 'axis'
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }]
    },
    grid: [
      { left: '8%', right: '5%', top: '15%', height: '55%' },
      { left: '8%', right: '5%', top: '75%', height: '15%' }
    ],
    xAxis: [
      {
        type: 'category',
        data: labels,
        boundaryGap: false,
        axisLine: { onZero: false }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: labels,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisLabel: { show: false }
      }
    ],
    yAxis: [
      {
        scale: true,
        splitArea: { show: true }
      },
      {
        scale: true,
        gridIndex: 1
      }
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 60, end: 100 },
      { show: true, xAxisIndex: [0, 1], type: 'slider', top: '93%', start: 60, end: 100 }
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: klineData,
        itemStyle: {
          color: '#ef232a',
          color0: '#14b143',
          borderColor: '#ef232a',
          borderColor0: '#14b143'
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeData
      }
    ]
  }
})

const renderChart = () => {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption(option.value, true)
}

watch(
  () => props.data,
  () => {
    renderChart()
  },
  { deep: true }
)

onMounted(() => {
  renderChart()
  window.addEventListener('resize', resizeChart)
})

const resizeChart = () => {
  chartInstance?.resize()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 520px;
}
</style>
