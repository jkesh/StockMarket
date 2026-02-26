<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <div class="brand">模拟盘交易系统</div>
      <el-menu mode="horizontal" :default-active="activeMenu" router>
        <el-menu-item index="/">股票总览</el-menu-item>
        <el-menu-item index="/trade">模拟交易</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => (route.path.startsWith('/trade') ? '/trade' : '/'))
</script>
