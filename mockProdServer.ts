/**
 * 生产环境 Mock 服务
 *
 * vite-plugin-mock 3.x 不支持 prodEnabled，改用 Mock.js 直接拦截 XHR
 * Mock.js 会在前端拦截所有匹配的请求，无需后端服务
 *
 * 部署到 Vercel 时，这个文件会被打包进 chunk，在 main.ts 中激活
 */
import Mock from 'mockjs'
import type { MockMethod } from 'vite-plugin-mock'

// 静态导入所有 mock 模块（Vite 构建时打包）
import authMock from './mock/auth'
import dashboardMock from './mock/dashboard'
import systemMock from './mock/system'
import projectMock from './mock/project'
import supplyMock from './mock/supply'

const allMocks: MockMethod[] = [
  ...authMock,
  ...dashboardMock,
  ...systemMock,
  ...projectMock,
  ...supplyMock,
]

/**
 * 设置生产环境 mock
 * 把 vite-plugin-mock 格式的 MockMethod 转换成 Mock.js 格式
 */
export function setupProdMockServer() {
  allMocks.forEach((mock) => {
    const method = (mock.method || 'get').toLowerCase()
    // Mock.js 用正则匹配 URL（去掉 /api 前缀）
    const url = mock.url.replace(/^\/api/, '/api').replace(/\?.*$/, '')

    if (method === 'get') {
      Mock.mock(url, 'get', () => {
        // 模拟 vite-plugin-mock 的 response 调用
        const res = mock.response({ query: {}, body: {} } as any)
        return res
      })
    } else {
      // post/put/delete
      Mock.mock(url, method, (options: { body?: string }) => {
        const body = options.body ? JSON.parse(options.body) : {}
        const res = mock.response({ body } as any)
        return res
      })
    }
  })

  // eslint-disable-next-line no-console
  console.log(`[Mock] 生产环境已注入 ${allMocks.length} 个 mock 接口`)
}
