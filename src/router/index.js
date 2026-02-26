import { createRouter, createWebHistory } from 'vue-router'
import StockDashboard from '../views/StockDashboard.vue'
import TradeSimulator from '../views/TradeSimulator.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: StockDashboard },
    { path: '/trade', name: 'trade', component: TradeSimulator }
  ]
})

export default router
