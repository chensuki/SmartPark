import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/global'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/auth'

const TOKEN_KEY = 'sp_token'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(null)

  /** 是否已登录 */
  const isLogin = () => !!token.value

  /** 登录 */
  async function login(username: string, password: string) {
    const res = await loginApi({ username, password })
    token.value = res.token
    userInfo.value = res.userInfo
    localStorage.setItem(TOKEN_KEY, res.token)
    return res
  }

  /** 拉取用户信息（刷新页面后恢复用） */
  async function fetchUserInfo() {
    if (!token.value) return null
    const info = await getUserInfo()
    userInfo.value = info
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
    localStorage.removeItem(TOKEN_KEY)
  }

  /** 权限校验 */
  function hasPermission(perm: string) {
    return userInfo.value?.permissions?.includes(perm) ?? false
  }

  return {
    token,
    userInfo,
    isLogin,
    login,
    fetchUserInfo,
    logout,
    hasPermission,
  }
})
