import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 虚拟列表（大屏告警流用）
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import App from './App.vue'
import router from './router'
import { setupDirectives } from './directives'

// 全局样式（顺序：reset → index → Element Plus 主题覆盖）
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'virtual:svg-icons-register'
import '@/styles/index.scss'

const app = createApp(App)

// Pinia（带持久化）
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// Router
app.use(router)

// 虚拟列表
app.use(VueVirtualScroller)

// Element Plus 图标全量注册（按需可优化）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 自定义指令
setupDirectives(app)

// 全局错误兜底
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Global Error]', info, err)
  // 生产环境可接入 Sentry / 自建上报
}

app.mount('#app')
