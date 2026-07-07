import { onBeforeUnmount, onMounted, shallowRef, type Ref } from 'vue'
import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  MapChart,
  EffectScatterChart,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent,
  DataZoomComponent,
  GraphicComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

// 按需注册（EffectScatter 用于飞线动效，VisualMap 用于热力图例）
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  MapChart,
  EffectScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GeoComponent,
  DataZoomComponent,
  GraphicComponent,
  VisualMapComponent,
  CanvasRenderer,
])

// 默认主题：暖白 + 朱砂红（覆盖 ECharts 默认蓝）
const LIGHT_THEME = {
  color: ['#c96442', '#1f6e8c', '#976d23', '#2b593f', '#1f5b78', '#b13b2c'],
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, Noto Sans SC, sans-serif', color: '#37352f' },
}

// 暗黑主题：赛博（监控大屏用）
const DARK_THEME = {
  color: ['#7ed3a4', '#3b6cff', '#f5a524', '#e0445a', '#9b59b6', '#1abc9c'],
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'JetBrains Mono, monospace', color: '#e6edf3' },
}

/** 已注册的地图名称缓存（避免重复注册） */
const registeredMaps = new Set<string>()

/**
 * 注册中国地图（从 DataV 公开 geoJSON 加载，失败时返回 false 走兜底）
 * 数据源：https://datav.aliyun.com/portal/school/atlas/area_selector
 */
export async function registerChinaMap(): Promise<boolean> {
  if (registeredMaps.has('china')) return true
  try {
    const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    if (!res.ok) throw new Error('地图加载失败')
    const geo = await res.json()
    echarts.registerMap('china', geo)
    registeredMaps.add('china')
    return true
  } catch (e) {
    console.warn('[echarts] 中国地图加载失败，散点将基于空白地图渲染', e)
    return false
  }
}

/**
 * ECharts 组件化封装
 *
 * @example
 * const chartRef = ref<HTMLElement | null>(null)
 * const { setOption, resize } = useECharts(chartRef)
 * setOption({ series: [...] })
 *
 * <template><div ref="chartRef" style="height: 240px"></div></template>
 */
export function useECharts(chartRef: Ref<HTMLElement | null>, theme: 'light' | 'dark' = 'light') {
  // 用 shallowRef 避免对 echarts 实例做深度响应式（性能）
  const instance = shallowRef<echarts.ECharts | null>(null)

  function init() {
    if (!chartRef.value || instance.value) return
    instance.value = echarts.init(chartRef.value, undefined, {
      renderer: 'canvas',
    })
    // 注入主题配色
    const palette = theme === 'dark' ? DARK_THEME : LIGHT_THEME
    instance.value.setOption({ color: palette.color } as EChartsOption)
  }

  function setOption(option: EChartsOption, notMerge = false) {
    // 确保 DOM 挂载后初始化
    if (!instance.value) init()
    instance.value?.setOption(option, notMerge)
  }

  function resize() {
    instance.value?.resize()
  }

  function dispose() {
    instance.value?.dispose()
    instance.value = null
  }

  // 生命周期：挂载后初始化、卸载前销毁
  onMounted(() => {
    init()
    window.addEventListener('resize', resize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    dispose()
  })

  return {
    instance,
    setOption,
    resize,
    dispose,
  }
}

export { echarts }
export type { EChartsOption }
export type EChartsRef = Ref<HTMLElement | null>
