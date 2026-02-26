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
    backgroundColor: 'transparent',
    animation: false,
    title: {
      text: props.stockCode ? `${props.stockCode} · K线` : 'K线走势',
      textStyle: {
        color: '#d7e3ff',
        fontSize: 13,
        fontWeight: 500
      }
    },
    legend: {
      top: 2,
      right: 8,
      textStyle: {
        color: '#8da2c7'
      },
      data: ['K线', '成交量']
    },
    tooltip: {
      trigger: 'axis',
      borderColor: '#25314c',
      backgroundColor: 'rgba(15, 23, 38, 0.94)',
      textStyle: { color: '#dce8ff' }
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }]
    },
    grid: [
      { left: '8%', right: '5%', top: '13%', height: '57%' },
      { left: '8%', right: '5%', top: '75%', height: '15%' }
    ],
    xAxis: [
      {
        type: 'category',
        data: labels,
        boundaryGap: false,
        axisLine: { onZero: false, lineStyle: { color: '#2b3a5a' } },
        axisLabel: { color: '#8da2c7' }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: labels,
        boundaryGap: false,
        axisLine: { onZero: false, lineStyle: { color: '#2b3a5a' } },
        axisLabel: { show: false }
      }
    ],
    yAxis: [
      {
        scale: true,
        splitArea: { show: false },
        splitLine: { lineStyle: { color: '#1f2d47' } },
        axisLabel: { color: '#8da2c7' }
      },
      {
        scale: true,
        gridIndex: 1,
        splitLine: { lineStyle: { color: '#1f2d47' } },
        axisLabel: { color: '#8da2c7' }
      }
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 68, end: 100 },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        top: '93%',
        start: 68,
        end: 100,
        borderColor: '#273655',
        fillerColor: 'rgba(41, 98, 255, 0.18)',
        backgroundColor: 'rgba(25, 35, 58, 0.5)'
      }
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: klineData,
        itemStyle: {
          color: '#00c076',
          color0: '#ff4d4f',
          borderColor: '#00c076',
          borderColor0: '#ff4d4f'
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeData,
        itemStyle: {
          color: '#4e6aa6'
        }
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
  height: 560px;
}
</style>
