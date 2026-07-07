import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * 按钮级权限指令 v-permission
 *
 * @example
 * <el-button v-permission="'user:add'">新增用户</el-button>
 * <el-button v-permission="['user:edit', 'user:add']">编辑</el-button>
 *
 * 行为：无权限时移除该元素（而非 display:none，更彻底）
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    checkPermission(el, binding)
  },
}

function checkPermission(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
  const { value } = binding
  const userStore = useUserStore()

  if (!value) return

  const required = Array.isArray(value) ? value : [value]
  // 满足任意一个权限即可
  const hasPermission = required.some((p) => userStore.hasPermission(p))

  if (!hasPermission) {
    el.parentNode?.removeChild(el)
  }
}

export default permission
