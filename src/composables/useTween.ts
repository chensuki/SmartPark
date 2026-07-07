import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * 数字 tween 动画
 * 灵感来源: html-anything / live-dashboard 的 tweenText()
 *
 * @example
 * const display = useTween(someNumberRef, { duration: 600 })
 * // display.value 会从旧值平滑过渡到 someNumberRef.value
 */
export interface TweenOptions {
  /** 动画时长 ms */
  duration?: number
  /** 缓动函数，默认 ease-out cubic */
  easing?: (t: number) => number
  /** 是否禁用（用于 prefers-reduced-motion） */
  disabled?: boolean
  /** 小数位数 */
  decimals?: number
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export function useTween(source: Ref<number>, options: TweenOptions = {}): Ref<number> {
  const { duration = 600, easing = easeOutCubic, disabled = false, decimals = 0 } = options

  const display = ref(source.value)
  let rafId: number | null = null

  watch(
    source,
    (to, from) => {
      if (disabled) {
        display.value = to
        return
      }
      // 检测系统级减弱动效偏好
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        display.value = to
        return
      }

      const startVal = from ?? to
      if (startVal === to) return

      if (rafId) cancelAnimationFrame(rafId)
      const start = performance.now()

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = easing(t)
        const value = startVal + (to - startVal) * eased
        display.value = decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value)
        if (t < 1) {
          rafId = requestAnimationFrame(step)
        }
      }
      rafId = requestAnimationFrame(step)
    },
    { immediate: false }
  )

  // 组件卸载时取消未完成的 rAF，避免更新已销毁的 ref（内存泄漏/报错）
  onScopeDispose(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })

  return display
}
