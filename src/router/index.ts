import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/user'

// =========================================================================
// 静态路由（不需要权限）
// =========================================================================
export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: '📊', affix: true, keepAlive: true },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/analytics/index.vue'),
        meta: { title: '数据分析', icon: '📈', keepAlive: true },
      },
      {
        path: 'building',
        name: 'Building',
        component: () => import('@/views/building/index.vue'),
        meta: { title: '楼宇资产', icon: '🏢', keepAlive: true },
      },
      {
        path: 'device',
        name: 'Device',
        component: () => import('@/views/device/index.vue'),
        meta: { title: '设备监控', icon: '🔌', keepAlive: true },
      },
    ],
  },
  // 监控大屏（独立全屏布局，无侧栏）
  {
    path: '/screen',
    name: 'Screen',
    component: () => import('@/views/screen/index.vue'),
    meta: { title: '智慧园区监控大屏', hidden: true },
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
  // 切换路由后回到顶部
  scrollBehavior: () => ({ top: 0 }),
})

// =========================================================================
// 全局前置守卫：鉴权 + 进度条 + 标题
// =========================================================================
const WHITE_LIST = ['/login']

router.beforeEach((to, _from, next) => {
  NProgress.start()
  document.title = to.meta.title ? `${to.meta.title} · SmartPark` : 'SmartPark · 智慧园区运营平台'

  const userStore = useUserStore()
  const hasToken = userStore.isLogin()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      next()
    }
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
