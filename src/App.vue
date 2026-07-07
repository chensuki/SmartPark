<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

onMounted(() => {
  // 启动时恢复主题（从 localStorage 持久化）
  appStore.setTheme(appStore.theme)
  // 移除首屏 loading
  const loading = document.getElementById('app-loading')
  loading?.remove()
})
</script>
