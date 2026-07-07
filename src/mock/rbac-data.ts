// =========================================================================
// RBAC Mock 数据（集中管理，用户/角色/菜单共享）
// =========================================================================
import type { MenuItem, Role, SystemUser } from '@/types/rbac'

/** 完整菜单树（包含 directory/menu/button 三类） */
export const MENU_TREE: MenuItem[] = [
  {
    id: 'm-dashboard',
    parentId: null,
    name: '工作台',
    path: '/dashboard',
    component: 'dashboard/index',
    icon: 'Odometer',
    sort: 1,
    type: 'menu',
    keepAlive: true,
  },
  {
    id: 'm-analytics',
    parentId: null,
    name: '数据分析',
    path: '/analytics',
    component: 'analytics/index',
    icon: 'TrendCharts',
    sort: 2,
    type: 'menu',
    keepAlive: true,
  },
  {
    id: 'm-map',
    parentId: null,
    name: '全国园区监控',
    path: '/map',
    component: 'screen/china-map',
    icon: 'MapLocation',
    sort: 3,
    type: 'menu',
    keepAlive: true,
  },
  // 业务管理目录
  {
    id: 'd-business',
    parentId: null,
    name: '园区业务',
    icon: 'OfficeBuilding',
    sort: 4,
    type: 'directory',
    redirect: '/building',
    children: [
      {
        id: 'm-building',
        parentId: 'd-business',
        name: '楼宇资产',
        path: '/building',
        component: 'building/index',
        icon: 'OfficeBuilding',
        sort: 1,
        type: 'menu',
        keepAlive: true,
        children: [
          {
            id: 'b-building-add',
            parentId: 'm-building',
            name: '新增',
            sort: 1,
            type: 'button',
            permission: 'building:add',
          },
          {
            id: 'b-building-edit',
            parentId: 'm-building',
            name: '编辑',
            sort: 2,
            type: 'button',
            permission: 'building:edit',
          },
          {
            id: 'b-building-del',
            parentId: 'm-building',
            name: '删除',
            sort: 3,
            type: 'button',
            permission: 'building:delete',
          },
        ],
      },
      {
        id: 'm-device',
        parentId: 'd-business',
        name: '设备监控',
        path: '/device',
        component: 'device/index',
        icon: 'Cpu',
        sort: 2,
        type: 'menu',
        keepAlive: true,
      },
      {
        id: 'm-project',
        parentId: 'd-business',
        name: '项目协作',
        path: '/project',
        component: 'project/index',
        icon: 'Tickets',
        sort: 3,
        type: 'menu',
        keepAlive: true,
        children: [
          {
            id: 'b-project-add',
            parentId: 'm-project',
            name: '新建任务',
            sort: 1,
            type: 'button',
            permission: 'project:add',
          },
          {
            id: 'b-project-assign',
            parentId: 'm-project',
            name: '指派',
            sort: 2,
            type: 'button',
            permission: 'project:assign',
          },
        ],
      },
      {
        id: 'm-supply',
        parentId: 'd-business',
        name: '供应链',
        path: '/supply',
        component: 'supply/index',
        icon: 'Box',
        sort: 4,
        type: 'menu',
        keepAlive: true,
      },
    ],
  },
  // 系统管理目录
  {
    id: 'd-system',
    parentId: null,
    name: '系统管理',
    icon: 'Setting',
    sort: 10,
    type: 'directory',
    redirect: '/system/user',
    children: [
      {
        id: 'm-user',
        parentId: 'd-system',
        name: '用户管理',
        path: '/system/user',
        component: 'system/user/index',
        icon: 'User',
        sort: 1,
        type: 'menu',
        keepAlive: true,
        children: [
          {
            id: 'b-user-add',
            parentId: 'm-user',
            name: '新增用户',
            sort: 1,
            type: 'button',
            permission: 'user:add',
          },
          {
            id: 'b-user-edit',
            parentId: 'm-user',
            name: '编辑用户',
            sort: 2,
            type: 'button',
            permission: 'user:edit',
          },
          {
            id: 'b-user-del',
            parentId: 'm-user',
            name: '删除用户',
            sort: 3,
            type: 'button',
            permission: 'user:delete',
          },
          {
            id: 'b-user-reset',
            parentId: 'm-user',
            name: '重置密码',
            sort: 4,
            type: 'button',
            permission: 'user:reset',
          },
        ],
      },
      {
        id: 'm-role',
        parentId: 'd-system',
        name: '角色管理',
        path: '/system/role',
        component: 'system/role/index',
        icon: 'Lock',
        sort: 2,
        type: 'menu',
        keepAlive: true,
        children: [
          {
            id: 'b-role-add',
            parentId: 'm-role',
            name: '新增角色',
            sort: 1,
            type: 'button',
            permission: 'role:add',
          },
          {
            id: 'b-role-edit',
            parentId: 'm-role',
            name: '编辑角色',
            sort: 2,
            type: 'button',
            permission: 'role:edit',
          },
          {
            id: 'b-role-auth',
            parentId: 'm-role',
            name: '分配权限',
            sort: 3,
            type: 'button',
            permission: 'role:auth',
          },
        ],
      },
      {
        id: 'm-menu',
        parentId: 'd-system',
        name: '菜单管理',
        path: '/system/menu',
        component: 'system/menu/index',
        icon: 'Grid',
        sort: 3,
        type: 'menu',
        keepAlive: true,
      },
    ],
  },
]

/** 角色 */
export const ROLES: Role[] = [
  {
    id: 'r-admin',
    name: '超级管理员',
    code: 'admin',
    description: '拥有所有权限',
    menuIds: [], // 空 = 全部权限
    userCount: 1,
    createdAt: '2025-01-01 00:00:00',
    status: 'enabled',
  },
  {
    id: 'r-park-manager',
    name: '园区经理',
    code: 'park_manager',
    description: '管理园区业务，可查看数据和审批',
    menuIds: [
      'm-dashboard',
      'm-analytics',
      'd-business',
      'm-building',
      'b-building-add',
      'b-building-edit',
      'm-device',
      'm-project',
      'b-project-add',
      'b-project-assign',
    ],
    userCount: 5,
    createdAt: '2025-02-15 10:30:00',
    status: 'enabled',
  },
  {
    id: 'r-operator',
    name: '运维人员',
    code: 'operator',
    description: '设备巡检与告警处理',
    menuIds: ['m-dashboard', 'd-business', 'm-device', 'm-building'],
    userCount: 12,
    createdAt: '2025-03-20 14:00:00',
    status: 'enabled',
  },
  {
    id: 'r-viewer',
    name: '访客',
    code: 'viewer',
    description: '只读权限',
    menuIds: ['m-dashboard', 'm-analytics'],
    userCount: 3,
    createdAt: '2025-04-10 09:15:00',
    status: 'disabled',
  },
]

/** 用户 */
export const USERS: SystemUser[] = [
  {
    id: 'u001',
    username: 'admin',
    name: '系统管理员',
    email: 'admin@smartpark.com',
    phone: '138****0001',
    roleId: 'r-admin',
    roleName: '超级管理员',
    status: 'enabled',
    lastLoginAt: '2026-07-07 14:30',
    createdAt: '2025-01-01',
  },
  {
    id: 'u002',
    username: 'zhangming',
    name: '张明',
    email: 'zhangming@smartpark.com',
    phone: '138****0002',
    roleId: 'r-park-manager',
    roleName: '园区经理',
    status: 'enabled',
    lastLoginAt: '2026-07-07 13:15',
    createdAt: '2025-02-16',
  },
  {
    id: 'u003',
    username: 'lina',
    name: '李娜',
    email: 'lina@smartpark.com',
    phone: '138****0003',
    roleId: 'r-park-manager',
    roleName: '园区经理',
    status: 'enabled',
    lastLoginAt: '2026-07-06 18:42',
    createdAt: '2025-02-20',
  },
  {
    id: 'u004',
    username: 'wangqiang',
    name: '王强',
    email: 'wangqiang@smartpark.com',
    phone: '138****0004',
    roleId: 'r-operator',
    roleName: '运维人员',
    status: 'enabled',
    lastLoginAt: '2026-07-07 09:00',
    createdAt: '2025-03-21',
  },
  {
    id: 'u005',
    username: 'zhaomin',
    name: '赵敏',
    email: 'zhaomin@smartpark.com',
    phone: '138****0005',
    roleId: 'r-operator',
    roleName: '运维人员',
    status: 'disabled',
    lastLoginAt: '2026-06-15 11:20',
    createdAt: '2025-03-25',
  },
  {
    id: 'u006',
    username: 'chenchen',
    name: '陈晨',
    email: 'chenchen@smartpark.com',
    phone: '138****0006',
    roleId: 'r-viewer',
    roleName: '访客',
    status: 'enabled',
    lastLoginAt: '2026-07-05 16:00',
    createdAt: '2025-04-11',
  },
]

/** 扁平化菜单（用于权限树展示） */
export function flattenMenus(menus: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = []
  function walk(list: MenuItem[]) {
    list.forEach((m) => {
      result.push(m)
      if (m.children?.length) walk(m.children)
    })
  }
  walk(menus)
  return result
}

/** 根据角色 ID 计算权限标识列表 */
export function getPermissionsByRole(roleId: string): string[] {
  const role = ROLES.find((r) => r.id === roleId)
  if (!role) return []
  // 管理员拥有全部
  if (role.code === 'admin') {
    return flattenMenus(MENU_TREE)
      .filter((m) => m.type === 'button' && m.permission)
      .map((m) => m.permission!)
  }
  // 根据勾选的 menuIds 找出所有 button 权限
  const allFlat = flattenMenus(MENU_TREE)
  return allFlat
    .filter((m) => m.type === 'button' && m.permission && role.menuIds.includes(m.id))
    .map((m) => m.permission!)
}

/** 根据角色 ID 过滤可见菜单树（去掉 button 和无权访问的） */
export function filterMenusByRole(roleId: string): MenuItem[] {
  const role = ROLES.find((r) => r.id === roleId)
  if (!role) return []
  if (role.code === 'admin') {
    return filterButtons(MENU_TREE)
  }
  return filterByMenuIds(MENU_TREE, role.menuIds)
}

/** 移除 button 类型（用于侧栏渲染） */
function filterButtons(menus: MenuItem[]): MenuItem[] {
  return menus
    .filter((m) => m.type !== 'button')
    .map((m) => ({
      ...m,
      children: m.children?.length ? filterButtons(m.children) : undefined,
    }))
}

/** 按勾选的 menuIds 过滤（保留父链） */
function filterByMenuIds(menus: MenuItem[], ids: string[]): MenuItem[] {
  return menus
    .map((m) => {
      // button 类型：只有在 ids 里才保留
      if (m.type === 'button') {
        return ids.includes(m.id) ? m : null
      }
      // directory/menu：递归处理子节点
      if (m.children?.length) {
        const filteredChildren = filterByMenuIds(m.children, ids)
        // 如果自己被勾选 或 有可见子节点，保留
        if (ids.includes(m.id) || filteredChildren.length > 0) {
          return { ...m, children: filterButtons(filteredChildren) }
        }
        return null
      }
      // 叶子 menu：在 ids 里才保留
      return ids.includes(m.id) ? m : null
    })
    .filter((m): m is MenuItem => m !== null)
}
