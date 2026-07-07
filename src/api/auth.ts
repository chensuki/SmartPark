import request from './request'
import type { UserInfo } from '@/types/global'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

/** 登录 */
export const login = (data: LoginParams) => request.post<LoginResult>('/auth/login', data)

/** 退出登录 */
export const logout = () => request.post<void>('/auth/logout')

/** 获取当前用户信息（用于刷新页面后恢复） */
export const getUserInfo = () => request.get<UserInfo>('/auth/user-info')
