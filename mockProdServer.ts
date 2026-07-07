/**
 * 生产环境 Mock 服务
 *
 * vite-plugin-mock 3.x 不支持 prodEnabled，改用 Mock.js 直接拦截 XHR
 * Mock.js 会在前端拦截所有匹配的请求，无需后端服务
 *
 * 部署到 Vercel 时，这个文件会被打包进 chunk，在 main.ts 中激活
 */
// mockjs 类型声明在 src/types/mockjs.d.ts
import Mock from 'mockjs'

// 简化的 MockMethod 类型（避免依赖 vite-plugin-mock 在 prod 时的类型）
interface ProdMockMethod {
  url: string
  method?: string
  response: (req: { query?: any; body?: any }) => any
}

// 静态导入所有 mock 模块（Vite 构建时打包）
import authMock from './mock/auth'
import dashboardMock from './mock/dashboard'
import systemMock from './mock/system'
import projectMock from './mock/project'
import supplyMock from './mock/supply'

const allMocks = [
  ...authMock,
  ...dashboardMock,
  ...systemMock,
  ...projectMock,
  ...supplyMock,
] as unknown as ProdMockMethod[]

/**
 * 设置生产环境 mock
 * 把 vite-plugin-mock 格式的 MockMethod 转换成 Mock.js 格式
 */
export function setupProdMockServer() {
  allMocks.forEach((mockItem) => {
    const method = (mockItem.method || 'get').toLowerCase()
    // Mock.js 用字符串匹配 URL（去掉 query 参数）
    const url = mockItem.url.replace(/\?.*$/, '')

    if (method === 'get') {
      Mock.mock(url, 'get', () => {
        return mockItem.response({ query: {}, body: {} })
      })
    } else {
      // post/put/delete
      Mock.mock(url, method, (options: { body?: string }) => {
        const body = options.body ? safeParse(options.body) : {}
        return mockItem.response({ body })
      })
    }
  })

  // eslint-disable-next-line no-console
  console.log(`[Mock] 生产环境已注入 ${allMocks.length} 个 mock 接口`)
}

/** 安全解析 JSON（mockjs 的 body 是字符串） */
function safeParse(str: string): any {
  try {
    return JSON.parse(str)
  } catch {
    return {}
  }
}
