import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'light' | 'dark'

export const useAppStore = defineStore(
  'app',
  () => {
    /** 主题 */
    const theme = ref<Theme>('light')
    /** 侧栏折叠 */
    const sidebarCollapsed = ref(false)
    /** 设备类型（响应式） */
    const device = ref<'desktop' | 'mobile'>('desktop')

    function setTheme(t: Theme) {
      theme.value = t
      document.documentElement.setAttribute('data-theme', t)
    }

    function toggleTheme() {
      setTheme(theme.value === 'light' ? 'dark' : 'light')
    }

    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function setDevice(d: 'desktop' | 'mobile') {
      device.value = d
    }

    return {
      theme,
      sidebarCollapsed,
      device,
      setTheme,
      toggleTheme,
      toggleSidebar,
      setDevice,
    }
  },
  {
    persist: {
      key: 'sp_app',
      pick: ['theme', 'sidebarCollapsed'],
    },
  },
)
