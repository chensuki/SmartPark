import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/user'
import type { MenuItem } from '@/types/rbac'

// 使用 import.meta.glob 预加载所有 view 组件
// key 形如 '/src/views/dashboard/index.vue'，按 component 字段（如 'dashboard/index'）匹配
const modules = import.meta.glob('../views/**/*.vue')

// =========================================================================
// 静态路由（无需权限）
// =========================================================================
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/screen',
    name: 'Screen',
    component: () => import('@/views/screen/index.vue'),
    meta: { title: '监控大屏', hidden: true },
  },
  // 动态路由的容器：所有后端返回的菜单都挂到这里
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      // 默认首页（保证未加载动态路由前也能访问）
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'Odometer', affix: true, keepAlive: true },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/analytics/index.vue'),
        meta: { title: '数据分析', icon: 'TrendCharts', keepAlive: true },
      },
      {
        path: 'map',
        name: 'ChinaMap',
        component: () => import('@/views/screen/china-map.vue'),
        meta: { title: '全国园区监控', icon: 'MapLocation', keepAlive: true },
      },
      {
        path: 'building',
        name: 'Building',
        component: () => import('@/views/building/index.vue'),
        meta: { title: '楼宇资产', icon: 'OfficeBuilding', keepAlive: true },
      },
      {
        path: 'device',
        name: 'Device',
        component: () => import('@/views/device/index.vue'),
        meta: { title: '设备监控', icon: 'Cpu', keepAlive: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE),
  routes: staticRoutes,
  scrollBehavior: () => ({ top: 0 }),
})

// =========================================================================
// 动态路由：把后端菜单树转换成 RouteRecordRaw 并注册
// 关键：跳过静态路由已存在的页面（避免 path/name 重复导致 router 崩溃）
// =========================================================================
export function generateRoutes(menus: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  const layoutRoute = staticRoutes.find((r) => r.name === 'Layout')!
  // 收集静态路由已有的 path 和 name，避免重复注册
  const existingPaths = new Set<string>()
  const existingNames = new Set<string>()
  ;(layoutRoute.children as RouteRecordRaw[]).forEach((c) => {
    if (c.path) existingPaths.add(c.path.startsWith('/') ? c.path : `/${c.path}`)
    if (c.name) existingNames.add(c.name as string)
  })

  function walk(list: MenuItem[]) {
    list.forEach((menu) => {
      if (menu.type !== 'menu' || !menu.path || !menu.component) {
        if (menu.children?.length) walk(menu.children)
        return
      }

      // 跳过静态路由已存在的（dashboard/analytics/building/device/map 等）
      const normalizedPath = menu.path.startsWith('/') ? menu.path : `/${menu.path}`
      if (existingPaths.has(normalizedPath)) {
        return
      }

      // 匹配组件
      const key = `../views/${menu.component}.vue`
      const comp = modules[key]
      if (!comp) {
        console.warn(`[router] 未找到组件: ${key}`)
        return
      }

      // 路由名：把 /system/user 转成 SystemUser
      const routeName = menu.path
        .replace(/^\//, '')
        .replace(/\/(.)/g, (_, c) => c.toUpperCase())
        .replace(/^(.)/, (_, c) => c.toUpperCase())

      // 跳过同名路由
      if (existingNames.has(routeName)) return

      const route: RouteRecordRaw = {
        path: normalizedPath,
        name: routeName,
        component: comp as any,
        meta: {
          title: menu.name,
          icon: menu.icon,
          keepAlive: menu.keepAlive,
        },
      }
      routes.push(route)
      existingPaths.add(normalizedPath)
      existingNames.add(routeName)
    })
  }
  walk(menus)

  // 关键修复：必须用 router.addRoute() 动态注册
  // Vue Router 4 在 createRouter 后会内部处理 routes 生成匹配表，
  // 直接 push 到 children 数组不会被识别（这是之前 /system/* 等 404 的根因）
  routes.forEach((r) => {
    router.addRoute('Layout', r)
  })

  return routes
}

// =========================================================================
// 全局前置守卫：鉴权 + 动态路由加载 + 进度条 + 标题
// =========================================================================
const WHITE_LIST = ['/login', '/screen']

router.beforeEach(async (to, _from, next) => {
  NProgress.start()
  document.title = to.meta.title ? `${to.meta.title} · SmartPark` : 'SmartPark · 智慧园区运营平台'

  const userStore = useUserStore()
  const hasToken = userStore.isLogin()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }

    // 关键：未加载动态路由时先加载（处理首次登录 + 刷新页面两种场景）
    if (!userStore.dynamicRoutesLoaded) {
      try {
        if (!userStore.userInfo) {
          await userStore.fetchUserInfo()
        }
        if (userStore.menus.length === 0) {
          await userStore.loadAccessData()
        }
        generateRoutes(userStore.menus)
        userStore.dynamicRoutesLoaded = true
        // 重新跳转一次，确保新注册的路由生效
        next({ ...to, replace: true })
        return
      } catch (e) {
        console.error('[router] 动态路由加载失败', e)
        await userStore.logout()
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        return
      }
    }
    next()
  } else {
    if (WHITE_LIST.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
