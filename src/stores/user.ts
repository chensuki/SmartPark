import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/global'
import type { MenuItem } from '@/types/rbac'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/auth'
import { getUserMenus, getUserPermissions } from '@/api/system'

const TOKEN_KEY = 'sp_token'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(null)
  /** 当前用户的可见菜单树（动态路由用） */
  const menus = ref<MenuItem[]>([])
  /** 是否已加载过动态路由（避免重复注册） */
  const dynamicRoutesLoaded = ref(false)

  /** 是否已登录 */
  const isLogin = () => !!token.value

  /** 登录 */
  async function login(username: string, password: string) {
    const res = await loginApi({ username, password })
    token.value = res.token
    userInfo.value = res.userInfo
    localStorage.setItem(TOKEN_KEY, res.token)
    // 登录后立即拉取权限和菜单
    await loadAccessData()
    return res
  }

  /** 加载权限和菜单数据（动态路由 + 按钮权限的基础） */
  async function loadAccessData() {
    try {
      const [menuList, perms] = await Promise.all([getUserMenus(), getUserPermissions()])
      menus.value = menuList
      if (userInfo.value) {
        userInfo.value.permissions = perms
      }
    } catch (e) {
      console.warn('[user] 加载权限数据失败，使用默认权限', e)
    }
  }

  /** 拉取用户信息（刷新页面后恢复用） */
  async function fetchUserInfo() {
    if (!token.value) return null
    const info = await getUserInfo()
    userInfo.value = info
    // 刷新后也要重新加载权限
    await loadAccessData()
    return info
  }

  /** 退出 */
  async function logout() {
    try {
      await logoutApi()
    } catch {
      // 静默处理
    }
    token.value = ''
    userInfo.value = null
    menus.value = []
    dynamicRoutesLoaded.value = false
    localStorage.removeItem(TOKEN_KEY)
  }

  /** 权限校验 */
  function hasPermission(perm: string) {
    // admin 角色直接放行
    if (userInfo.value?.role === 'admin') return true
    return userInfo.value?.permissions?.includes(perm) ?? false
  }

  return {
    token,
    userInfo,
    menus,
    dynamicRoutesLoaded,
    isLogin,
    login,
    loadAccessData,
    fetchUserInfo,
    logout,
    hasPermission,
  }
})
