// Vue SFC 类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

// SVG 模块声明（vite-plugin-svg-icons 用）
declare module '*.svg' {
  const content: string
  export default content
}

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_PORT: string
  readonly VITE_BASE: string
  readonly VITE_API_BASE: string
  readonly VITE_USE_MOCK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
