import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import { viteMockServe } from 'vite-plugin-mock'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const port = Number(env.VITE_PORT) || 5173

  return {
    base: env.VITE_BASE || '/',
    plugins: [
      vue(),
      // 自动导入 Vue / Vue Router / Pinia / VueUse 等 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: { enabled: true },
      }),
      // 自动注册组件（Element Plus 按需 + 自定义组件）
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/components.d.ts',
        dirs: ['src/components'],
      }),
      // SVG 雪碧图
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
      // Mock 服务（dev 和 prod 都生效，Demo 项目无需后端）
      viteMockServe({
        mockPath: 'mock',
        enable: true,
        // 生产环境也启用 mock（Demo 项目部署到 Vercel 时无需后端服务）
        prodEnabled: true,
        // 生产环境注入 mock 代码到入口
        injectCode: 'import { setupProdMockServer } from "./mockProdServer"; setupProdMockServer();',
        logger: mode === 'development',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 全局注入 variables + mixins（每个 .scss/.vue style 都能用 $token 和 @include）
          additionalData: `@use "@/styles/variables.scss" as *;\n@use "@/styles/mixins.scss" as *;`,
          api: 'modern-compiler',
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE || 'http://localhost:5173',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // 分包策略：vendor 拆分，提升缓存命中
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            element: ['element-plus', '@element-plus/icons-vue'],
            echarts: ['echarts'],
            utils: ['axios', 'dayjs', 'lodash-es', '@vueuse/core'],
          },
        },
      },
    },
  }
})
