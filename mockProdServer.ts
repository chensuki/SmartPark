/**
 * 生产环境 Mock 服务入口
 * vite-plugin-mock 在 prodEnabled: true 时，通过 createProdMockServer 注入 mock 接口
 */
import { createProdMockServer } from 'vite-plugin-mock/es/createProdMockServer'

// 动态导入所有 mock 模块（Vite 构建时会打包进 chunk）
const modules = import.meta.glob('./mock/*.ts', { eager: true, import: 'default' })

const mockModules: any[] = []
Object.keys(modules).forEach((key) => {
  const mod = (modules as Record<string, any>)[key]
  if (Array.isArray(mod)) {
    mockModules.push(...mod)
  }
})

export function setupProdMockServer() {
  createProdMockServer(mockModules)
}
