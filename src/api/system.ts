import request from './request'
import type { MenuItem, Role, SystemUser, UserQuery } from '@/types/rbac'
import type { PaginatedData } from '@/types/global'

// ============ 菜单 ============
/** 完整菜单树（菜单管理用） */
export const getMenuTree = () => request.get<MenuItem[]>('/system/menu/tree')

/** 当前用户可见菜单（动态路由用） */
export const getUserMenus = () => request.get<MenuItem[]>('/system/user/menus')

// ============ 角色 ============
export const getRoleList = (keyword?: string) =>
  request.get<Role[]>('/system/role/list', { params: { keyword } })

export const getRoleDetail = (id: string) =>
  request.get<Role>('/system/role/detail', { params: { id } })

export const saveRole = (data: Partial<Role>) => request.post<void>('/system/role/save', data)

export const deleteRole = (id: string) => request.post<void>('/system/role/delete', { id })

// ============ 用户 ============
export const getUserList = (params: UserQuery) =>
  request.get<PaginatedData<SystemUser>>('/system/user/list', { params })

export const saveUser = (data: Partial<SystemUser>) => request.post<void>('/system/user/save', data)

export const deleteUsers = (ids: string[]) => request.post<void>('/system/user/delete', { ids })

export const getUserPermissions = () => request.get<string[]>('/system/user/permissions')
