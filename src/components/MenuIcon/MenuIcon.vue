<template>
  <el-icon class="menu-icon" :size="size">
    <component :is="resolvedIcon" />
  </el-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/**
 * 通用图标组件
 * - 传入 Element Plus 图标名（如 'Odometer'）→ 渲染对应线性 SVG 图标
 * - 传入未知名 → 兜底显示一个默认图标，避免空白
 *
 * 用法：<MenuIcon name="Odometer" />
 *      <MenuIcon :name="item.icon" :size="18" />
 */
const props = withDefaults(
  defineProps<{
    name?: string
    size?: number
  }>(),
  {
    name: 'Menu',
    size: 18,
  }
)

// 所有 Element Plus 图标的映射表（key 是组件名，如 'Odometer'）
const iconMap = ElementPlusIconsVue as unknown as Record<string, any>

const resolvedIcon = computed(() => {
  // 优先精确匹配组件名
  if (props.name && iconMap[props.name]) {
    return iconMap[props.name]
  }
  // 兜底：默认菜单图标
  return iconMap.Menu
})
</script>

<style scoped lang="scss">
// 图标根容器：固定尺寸 + overflow hidden，防止不同 SVG 的尺寸差异导致布局错乱
.menu-icon {
  color: currentColor;
  flex-shrink: 0;
  // 确保图标不会撑高父容器
  line-height: 1;
}

// 强制 SVG 尺寸由 font-size 控制，不超过容器
:deep(svg) {
  width: 1em;
  height: 1em;
}
</style>
