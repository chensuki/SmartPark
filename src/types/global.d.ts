// =========================================================================
// 全局类型定义
// =========================================================================

/** 通用 API 响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页响应结构 */
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 分页查询参数 */
export interface PageQuery {
  page: number
  pageSize: number
  keyword?: string
  [key: string]: unknown
}

/** 通用选项 */
export interface SelectOption<V = string | number> {
  label: string
  value: V
  disabled?: boolean
}

/** 趋势方向 */
export type Trend = 'up' | 'down' | 'flat'

/** KPI 卡片数据 */
export interface KpiItem {
  label: string
  value: number | string
  delta?: number
  trend?: Trend
  unit?: string
  /** sparkline 数据 */
  series?: number[]
}

/** 状态枚举（来自 live-dashboard） */
export type Status = 'done' | 'progress' | 'blocked' | 'todo' | 'review'

/** 楼宇 */
export interface Building {
  id: string
  name: string
  code: string
  floors: number
  area: number
  occupancy: number
  status: Status
  manager?: string
}

/** 设备 */
export interface Device {
  id: string
  name: string
  type: string
  buildingId: string
  buildingName?: string
  status: 'online' | 'offline' | 'warning'
  lastHeartbeat?: string
  metrics?: Record<string, number>
}

/** 告警 */
export interface Alarm {
  id: string
  level: 'info' | 'warning' | 'danger'
  source: string
  message: string
  time: string
  resolved: boolean
}

/** 用户 */
export interface UserInfo {
  id: string
  name: string
  avatar?: string
  role: string
  permissions: string[]
}

/** 路由 meta */
declare module 'vue-router' {
  interface RouteMeta {
    /** 标题 */
    title?: string
    /** 图标（svg name 或 emoji） */
    icon?: string
    /** 是否需要鉴权 */
    requiresAuth?: boolean
    /** 所需角色 */
    roles?: string[]
    /** 是否在菜单隐藏 */
    hidden?: boolean
    /** 是否固定在 tab */
    affix?: boolean
    /** 缓存 */
    keepAlive?: boolean
  }
}
