<template>
  <div class="layout" :class="{ 'is-collapsed': appStore.sidebarCollapsed }">
    <!-- ============ 侧栏 ============ -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">SP</div>
        <span v-show="!appStore.sidebarCollapsed" class="brand-name">SmartPark</span>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          active-class="is-active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span v-show="!appStore.sidebarCollapsed" class="nav-label">{{ item.title }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer" v-show="!appStore.sidebarCollapsed">
        <div class="ws">
          <div class="ws-avatar">{{ userInitial }}</div>
          <div class="ws-info">
            <div class="ws-name">{{ userName }}</div>
            <div class="ws-role">{{ userRole }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ============ 主区 ============ -->
    <main class="main">
      <!-- 顶栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-btn" @click="appStore.toggleSidebar()" aria-label="切换侧栏">
            <el-icon><Fold v-if="!appStore.sidebarCollapsed" /><Expand v-else /></el-icon>
          </button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">SmartPark</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="topbar-right">
          <!-- 实时状态药丸（灵感来自 live-dashboard） -->
          <div class="pill-live" title="数据连接状态">
            <span class="dot"></span>
            <span>实时</span>
          </div>
          <!-- 主题切换 -->
          <button class="icon-btn" @click="appStore.toggleTheme()" aria-label="切换主题">
            <el-icon><Sunny v-if="appStore.theme === 'dark'" /><Moon v-else /></el-icon>
          </button>
          <!-- 大屏入口 -->
          <RouterLink to="/screen" class="icon-btn" title="监控大屏">
            <el-icon><Monitor /></el-icon>
          </RouterLink>
        </div>
      </header>

      <!-- 内容区 -->
      <section class="content">
        <RouterView v-slot="{ Component, route: r }">
          <transition name="fade" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="r.fullPath" />
            </keep-alive>
          </transition>
        </RouterView>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Fold, Expand, Sunny, Moon, Monitor } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { staticRoutes } from '@/router'

const appStore = useAppStore()
const userStore = useUserStore()
const route = useRoute()

// 从静态路由提取菜单（过滤掉 hidden 和根节点）
const menuItems = computed(() => {
  const rootRoute = staticRoutes.find((r) => r.path === '/')
  const children = rootRoute?.children || []
  return children
    .filter((c) => !c.meta?.hidden)
    .map((c) => ({
      path: `/${c.path}`,
      title: c.meta?.title || '',
      icon: c.meta?.icon || '📄',
    }))
})

const userName = computed(() => userStore.userInfo?.name || '游客')
const userRole = computed(() => userStore.userInfo?.role || 'guest')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const cachedViews = computed(() => {
  return staticRoutes
    .flatMap((r) => r.children || [])
    .filter((c) => c.meta?.keepAlive)
    .map((c) => c.name as string)
})
</script>

<style scoped lang="scss">
.layout {
  display: grid;
  grid-template-columns: $sidebar-width 1fr;
  min-height: 100vh;
  transition: grid-template-columns $dur-base $ease;

  &.is-collapsed {
    grid-template-columns: $sidebar-collapsed-width 1fr;
  }
}

// ============ 侧栏 ============
.sidebar {
  background: $color-bg-soft;
  border-right: 1px solid $color-line;
  padding: $sp-3;
  display: flex;
  flex-direction: column;
  user-select: none;
  overflow-y: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: $sp-2;
  padding: $sp-2 $sp-2 $sp-4;
}

.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: $radius-sm;
  background: linear-gradient(135deg, $color-accent, $color-accent-ink);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: $fw-bold;
  font-size: $fs-sm;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.brand-name {
  font-weight: $fw-semibold;
  font-size: $fs-md;
  letter-spacing: -0.01em;
}

.nav {
  margin-top: $sp-2;
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $sp-2;
  padding: $sp-2 $sp-3;
  border-radius: $radius-sm;
  color: $color-ink;
  font-size: $fs-md;
  transition: background $dur-fast $ease;

  &:hover {
    background: $color-bg-hover;
  }

  &.is-active {
    background: rgba(201, 100, 66, 0.08);
    color: $color-accent-ink;
    font-weight: $fw-medium;
  }
}

.nav-icon {
  font-size: $fs-md;
  width: 18px;
  text-align: center;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: $sp-3;
  border-top: 1px solid $color-line;
}

.ws {
  display: flex;
  align-items: center;
  gap: $sp-2;
  padding: $sp-2;
}

.ws-avatar {
  width: 32px;
  height: 32px;
  border-radius: $radius-full;
  background: $color-accent;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: $fw-semibold;
  font-size: $fs-sm;
  flex-shrink: 0;
}

.ws-info {
  min-width: 0;
}

.ws-name {
  font-weight: $fw-medium;
  font-size: $fs-sm;
  @include text-ellipsis(1);
}

.ws-role {
  font-size: $fs-xs;
  color: $color-ink-3;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

// ============ 主区 ============
.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: $color-bg;
}

.topbar {
  height: $topbar-height;
  padding: 0 $sp-6;
  border-bottom: 1px solid $color-line;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $color-bg;
  position: sticky;
  top: 0;
  z-index: $z-sticky;
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
  gap: $sp-3;
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: $radius-sm;
  color: $color-ink-2;
  transition: background $dur-fast $ease, color $dur-fast $ease;

  &:hover {
    background: $color-bg-hover;
    color: $color-ink;
  }
}

// 实时药丸（脉冲动画，来自 live-dashboard）
.pill-live {
  display: inline-flex;
  align-items: center;
  gap: $sp-1;
  padding: 2px $sp-2 2px $sp-1;
  background: #fff;
  border: 1px solid $color-line-strong;
  border-radius: $radius-full;
  font-size: $fs-sm;
  color: $color-ink-2;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: $radius-full;
    background: #2ecc71;
    animation: pulse 1.8s infinite;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.55);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(46, 204, 113, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
  }
}

@include reduce-motion {
  .pill-live .dot {
    animation: none;
  }
}

.content {
  flex: 1;
  padding: $sp-6;
  min-width: 0;
  overflow-y: auto;
}

// 路由切换过渡
.fade-enter-active,
.fade-leave-active {
  transition: opacity $dur-base $ease, transform $dur-base $ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
}

// 响应式：移动端隐藏侧栏（这里简化处理，实际可用抽屉）
@include respond-to('md') {
  .layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
}
</style>
