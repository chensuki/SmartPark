import type { MockMethod } from 'vite-plugin-mock'

export default [
  // 登录
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: { username: string } }) => {
      return {
        code: 0,
        message: 'ok',
        data: {
          token: `mock-token-${Date.now()}`,
          userInfo: {
            id: 'u001',
            name: body.username || '管理员',
            avatar: '',
            role: 'admin',
            permissions: ['building:add', 'building:edit', 'device:view'],
          },
        },
      }
    },
  },
  // 退出
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => ({ code: 0, message: 'ok', data: null }),
  },
  // 用户信息
  {
    url: '/api/auth/user-info',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'ok',
      data: {
        id: 'u001',
        name: '管理员',
        avatar: '',
        role: 'admin',
        permissions: ['building:add', 'building:edit', 'device:view'],
      },
    }),
  },
] as MockMethod[]
