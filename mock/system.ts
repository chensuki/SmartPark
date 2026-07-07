import type { MockMethod } from 'vite-plugin-mock'
import {
  MENU_TREE,
  ROLES,
  USERS,
  getPermissionsByRole,
  filterMenusByRole,
} from '../src/mock/rbac-data'

// 内存中的可变副本（支持增删改）
let users = [...USERS]
let roles = [...ROLES]

/**
 * 安全包装：避免单个 mock response 抛异常导致整个 dev server 崩溃
 * （vite-plugin-mock 的 worker 进程一旦抛未捕获异常，所有后续接口都会 404）
 */
function safe(handler: () => any): any {
  try {
    return handler()
  } catch (e) {
    console.error('[mock/system] response error:', e)
    return { code: 500, message: 'Mock 服务内部错误', data: null }
  }
}

export default [
  // ============ 菜单 ============
  {
    url: '/api/system/menu/tree',
    method: 'get',
    response: () => safe(() => ({ code: 0, message: 'ok', data: MENU_TREE })),
  },
  {
    url: '/api/system/user/menus',
    method: 'get',
    response: () =>
      safe(() => {
        const user = users[0]
        if (!user) return { code: 1, message: '无用户', data: [] }
        return { code: 0, message: 'ok', data: filterMenusByRole(user.roleId) }
      }),
  },

  // ============ 角色 ============
  {
    url: '/api/system/role/list',
    method: 'get',
    response: ({ query }: { query: { keyword?: string } }) =>
      safe(() => {
        const kw = query?.keyword
        const list = kw ? roles.filter((r) => r.name.includes(kw) || r.code.includes(kw)) : roles
        return { code: 0, message: 'ok', data: list }
      }),
  },
  {
    url: '/api/system/role/detail',
    method: 'get',
    response: ({ query }: { query: { id?: string } }) =>
      safe(() => {
        if (!query?.id) return { code: 400, message: '缺少 id 参数', data: null }
        const role = roles.find((r) => r.id === query.id)
        return { code: 0, message: 'ok', data: role || null }
      }),
  },
  {
    url: '/api/system/role/save',
    method: 'post',
    response: ({ body }: { body: any }) =>
      safe(() => {
        if (!body) return { code: 400, message: '缺少请求体', data: null }
        if (body.id) {
          const idx = roles.findIndex((r) => r.id === body.id)
          if (idx >= 0) roles[idx] = { ...roles[idx], ...body }
        } else {
          roles = [
            ...roles,
            {
              ...body,
              id: `r-${Date.now()}`,
              createdAt: new Date().toLocaleString('zh-CN'),
              userCount: 0,
              menuIds: Array.isArray(body.menuIds) ? body.menuIds : [], // 关键：补默认值，避免 undefined
              status: body.status || 'enabled',
            },
          ]
        }
        return { code: 0, message: 'ok', data: null }
      }),
  },
  {
    url: '/api/system/role/delete',
    method: 'post',
    response: ({ body }: { body: { id?: string } }) =>
      safe(() => {
        if (!body?.id) return { code: 400, message: '缺少 id', data: null }
        roles = roles.filter((r) => r.id !== body.id)
        return { code: 0, message: 'ok', data: null }
      }),
  },

  // ============ 用户 ============
  {
    url: '/api/system/user/list',
    method: 'get',
    response: ({ query }: { query: any }) =>
      safe(() => {
        const { page = 1, pageSize = 10, keyword, status, roleId } = query || {}
        let list = users
        if (keyword) {
          list = list.filter((u) => u.name.includes(keyword) || u.username.includes(keyword))
        }
        if (status) list = list.filter((u) => u.status === status)
        if (roleId) list = list.filter((u) => u.roleId === roleId)

        const total = list.length
        const start = (Number(page) - 1) * Number(pageSize)
        const rows = list.slice(start, start + Number(pageSize))
        return {
          code: 0,
          message: 'ok',
          data: { list: rows, total, page: Number(page), pageSize: Number(pageSize) },
        }
      }),
  },
  {
    url: '/api/system/user/save',
    method: 'post',
    response: ({ body }: { body: any }) =>
      safe(() => {
        if (!body) return { code: 400, message: '缺少请求体', data: null }
        if (body.id) {
          const idx = users.findIndex((u) => u.id === body.id)
          if (idx >= 0) {
            const role = roles.find((r) => r.id === body.roleId)
            users[idx] = { ...users[idx], ...body, roleName: role?.name }
          }
        } else {
          const role = roles.find((r) => r.id === body.roleId)
          users = [
            {
              ...body,
              id: `u-${Date.now()}`,
              roleName: role?.name,
              createdAt: new Date().toLocaleDateString('zh-CN'),
            },
            ...users,
          ]
        }
        return { code: 0, message: 'ok', data: null }
      }),
  },
  {
    url: '/api/system/user/delete',
    method: 'post',
    response: ({ body }: { body: { ids?: string[] } }) =>
      safe(() => {
        // 关键修复：校验 ids 存在且为数组（原代码假设 body.ids 一定存在，导致崩溃）
        const ids = body?.ids
        if (!Array.isArray(ids) || ids.length === 0) {
          return { code: 400, message: 'ids 必须为非空数组', data: null }
        }
        users = users.filter((u) => !ids.includes(u.id))
        return { code: 0, message: 'ok', data: null }
      }),
  },
  {
    url: '/api/system/user/permissions',
    method: 'get',
    response: () =>
      safe(() => {
        const user = users[0]
        if (!user) return { code: 0, message: 'ok', data: [] }
        return { code: 0, message: 'ok', data: getPermissionsByRole(user.roleId) }
      }),
  },
] as MockMethod[]
