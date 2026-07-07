// =========================================================================
// RBAC 权限系统类型定义
// =========================================================================

/** 菜单类型 */
export type MenuType = 'directory' | 'menu' | 'button'

/** 菜单项（树形结构） */
export interface MenuItem {
  id: string
  parentId: string | null
  name: string
  /** 路由路径（menu 类型才有） */
  path?: string
  /** 组件路径（menu 类型才有，对应 views/ 下的文件） */
  component?: string
  /** 重定向（directory 类型） */
  redirect?: string
  icon?: string
  /** 排序号 */
  sort: number
  type: MenuType
  /** 权限标识（button 类型：如 user:add） */
  permission?: string
  /** 是否在侧栏隐藏 */
  hidden?: boolean
  /** 是否缓存 */
  keepAlive?: boolean
  /** 子菜单 */
  children?: MenuItem[]
}

/** 角色 */
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  /** 关联的菜单 ID 列表 */
  menuIds: string[]
  /** 用户数（统计用） */
  userCount?: number
  createdAt: string
  status: 'enabled' | 'disabled'
}

/** 用户（扩展） */
export interface SystemUser {
  id: string
  username: string
  name: string
  avatar?: string
  email?: string
  phone?: string
  roleId: string
  roleName?: string
  status: 'enabled' | 'disabled'
  lastLoginAt?: string
  createdAt: string
}

/** 用户查询参数 */
export interface UserQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: string
  roleId?: string
  [key: string]: unknown
}
