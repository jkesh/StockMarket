<template>
  <div class="tv-shell">
    <header class="tv-topbar">
      <div class="tv-logo">
        <span class="dot"></span>
        SimTrade Pro
      </div>
      <div class="tv-topbar-center">
        <span class="market-pill">CN-A 股</span>
        <span class="market-pill">模拟盘</span>
        <span class="market-pill">实时监控</span>
      </div>
      <el-menu class="tv-menu" mode="horizontal" :default-active="activeMenu" router>
        <el-menu-item index="/">市场终端</el-menu-item>
        <el-menu-item index="/trade">交易工作台</el-menu-item>
      </el-menu>
    </header>

    <main class="tv-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => (route.path.startsWith('/trade') ? '/trade' : '/'))
</script>
