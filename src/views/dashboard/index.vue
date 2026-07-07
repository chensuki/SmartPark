<template>
  <div class="dashboard">
    <!-- 页头 -->
    <header class="page-head">
      <div>
        <h1 class="page-title">工作台</h1>
        <p class="page-sub">{{ greeting }}，{{ userName }} — 今日园区运行平稳</p>
      </div>
      <div class="page-actions">
        <el-button @click="handleRefresh" :loading="loading">
          <el-icon><Refresh /></el-icon>
          <span style="margin-left: 6px">刷新</span>
        </el-button>
        <el-button type="primary" @click="router.push('/screen')">
          <el-icon><Monitor /></el-icon>
          <span style="margin-left: 6px">监控大屏</span>
        </el-button>
      </div>
    </header>

    <!-- KPI 卡片 -->
    <section class="kpis">
      <div
        v-for="(kpi, i) in kpiList"
        :key="i"
        class="kpi-card"
        :style="{ animationDelay: `${i * 80}ms` }"
      >
        <div class="kpi-label">{{ kpi.label }}</div>
        <div class="kpi-value">
          <span class="num-flip" :class="{ flash: flashing[i] }">
            {{ kpi.display }}
          </span>
          <span v-if="kpi.unit" class="kpi-unit">{{ kpi.unit }}</span>
        </div>
        <div class="kpi-delta" :class="kpi.trend">
          <span class="arrow">{{ kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '·' }}</span>
          <span>{{ kpi.deltaText }}</span>
        </div>
        <!-- sparkline -->
        <svg v-if="kpi.series" class="spark" :viewBox="`0 0 100 24`" preserveAspectRatio="none">
          <path :d="sparkPath(kpi.series)" :fill="sparkFill(kpi)" />
          <path :d="sparkPath(kpi.series)" fill="none" :stroke="sparkColor(kpi)" stroke-width="1.5" />
        </svg>
      </div>
    </section>

    <!-- 双栏：能耗趋势 + 活动流 -->
    <section class="two-col">
      <div class="card">
        <div class="card-head">
          <h3>能耗趋势 · 近 7 日</h3>
          <span class="muted-2 text-mono">{{ energySum }} kWh</span>
        </div>
        <div ref="energyChartRef" class="energy-chart"></div>
      </div>

      <div class="card">
        <div class="card-head">
          <h3>实时活动</h3>
          <span class="muted-2">来自 <span class="accent">园区系统</span></span>
        </div>
        <ul class="feed">
          <li
            v-for="item in activities"
            :key="item.id"
            class="feed-row"
            :class="{ 'is-new': item._isNew }"
          >
            <span class="feed-avatar" :style="{ background: item.color }">
              {{ item.who.charAt(0) }}
            </span>
            <div class="feed-body">
              <span class="feed-who">{{ item.who }}</span>
              <span class="feed-action">{{ item.action }}</span>
              <span class="feed-target">{{ item.target }}</span>
            </div>
            <span class="feed-time">{{ item.time }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- 告警列表 -->
    <section class="card">
      <div class="card-head">
        <h3>实时告警</h3>
        <el-tag size="small" type="danger" effect="plain">{{ alarms.length }} 条</el-tag>
      </div>
      <el-table :data="alarms" style="width: 100%" size="default">
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.level === 'danger' ? 'danger' : row.level === 'warning' ? 'warning' : 'info'"
              size="small"
              effect="light"
            >
              {{ levelText[row.level] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="180" />
        <el-table-column prop="message" label="告警内容" min-width="280" show-overflow-tooltip />
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default>
            <el-button link type="primary" size="small">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Monitor } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getDashboardKpis, getDashboardActivities, getDashboardAlarms } from '@/api/dashboard'
import { useECharts } from '@/composables/useECharts'
import type { KpiItem, Alarm } from '@/types/global'

const router = useRouter()
const userStore = useUserStore()

const userName = computed(() => userStore.userInfo?.name || '管理员')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

// ============ KPI ============
const loading = ref(false)
const flashing = reactive<Record<number, boolean>>({})

interface DisplayKpi extends KpiItem {
  display: number | string
  deltaText: string
}

const kpiList = ref<DisplayKpi[]>([
  { label: '入驻企业', value: 0, display: 0, unit: '家', delta: 12, trend: 'up', deltaText: '本月 +12', series: [8, 9, 11, 10, 12, 14, 15] },
  { label: '设备总数', value: 0, display: 0, unit: '台', delta: 24, trend: 'up', deltaText: '本月 +24', series: [120, 135, 140, 150, 160, 175, 180] },
  { label: '在线率', value: 0, display: 0, unit: '%', delta: 2, trend: 'up', deltaText: '环比 +2%', series: [95, 96, 94, 97, 98, 99, 99] },
  { label: '告警数', value: 0, display: 0, unit: '条', delta: -3, trend: 'down', deltaText: '环比 -3', series: [12, 9, 11, 8, 7, 5, 4] },
])

async function loadKpis() {
  loading.value = true
  try {
    const data = await getDashboardKpis()
    kpiList.value = kpiList.value.map((k, i) => ({
      ...k,
      ...data[i],
      display: k.display,
    }))
    // tween 动画
    kpiList.value.forEach((k, i) => {
      const target = Number(k.value)
      const from = Number(k.display) || 0
      if (from === target) return
      tweenNumber(i, from, target, 800)
    })
  } catch (e) {
    console.warn('[dashboard] KPI fallback to defaults', e)
  } finally {
    loading.value = false
  }
}

function tweenNumber(idx: number, from: number, to: number, duration: number) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    kpiList.value[idx].display = to
    return
  }
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    kpiList.value[idx].display = Math.round(from + (to - from) * eased)
    if (t < 1) requestAnimationFrame(step)
  }
  flashing[idx] = true
  requestAnimationFrame(step)
  setTimeout(() => (flashing[idx] = false), 800)
}

// ============ sparkline 计算 ============
function sparkPath(series: number[]): string {
  const max = Math.max(...series, 1)
  const min = Math.min(...series)
  const range = max - min || 1
  const step = 100 / (series.length - 1)
  const pts = series.map((v, i) => `${i * step},${24 - ((v - min) / range) * 20 - 2}`)
  return `M ${pts.join(' L ')}`
}

function sparkColor(kpi: DisplayKpi): string {
  return kpi.trend === 'down' && kpi.label === '告警数' ? '#2b8a3e' : '#c96442'
}

function sparkFill(kpi: DisplayKpi): string {
  return kpi.trend === 'down' && kpi.label === '告警数'
    ? 'rgba(43,138,62,0.1)'
    : 'rgba(201,100,66,0.08)'
}

// ============ 能耗图 ============
const energyChartRef = ref<HTMLElement | null>(null)
const energy = useECharts(energyChartRef, 'light')

const energySum = computed(() =>
  kpiList.value[0]?.series?.reduce((a, b) => a + b, 0) ?? 0,
)

function renderEnergyChart() {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = [320, 380, 410, 360, 420, 280, 240]
  energy.setOption({
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: days,
      axisLine: { lineStyle: { color: '#ececea' } },
      axisLabel: { color: '#9b9a97' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#ececea', type: 'dashed' } },
      axisLabel: { color: '#9b9a97' },
    },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2.5, color: '#c96442' },
        itemStyle: { color: '#c96442' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(201,100,66,0.25)' },
              { offset: 1, color: 'rgba(201,100,66,0)' },
            ],
          },
        },
      },
    ],
  })
}

// ============ 活动流 ============
interface ActivityItem {
  id: string
  who: string
  action: string
  target: string
  time: string
  color: string
  _isNew?: boolean
}

const activities = ref<ActivityItem[]>([])

async function loadActivities() {
  try {
    const data = await getDashboardActivities()
    activities.value = data.map((d, i) => ({
      ...d,
      color: ['#f1c40f', '#3498db', '#e67e22', '#9b59b6', '#1abc9c'][i % 5],
    }))
  } catch (e) {
    console.warn('[dashboard] activities fallback', e)
  }
}

// ============ 告警 ============
const alarms = ref<Alarm[]>([])
const levelText: Record<string, string> = {
  info: '信息',
  warning: '警告',
  danger: '危险',
}

async function loadAlarms() {
  try {
    alarms.value = await getDashboardAlarms()
  } catch (e) {
    console.warn('[dashboard] alarms fallback', e)
  }
}

// ============ 刷新 ============
async function handleRefresh() {
  await Promise.all([loadKpis(), loadActivities(), loadAlarms()])
}

// ============ 生命周期 ============
onMounted(async () => {
  await Promise.all([loadKpis(), loadActivities(), loadAlarms()])
  renderEnergyChart()
})
</script>

<style scoped lang="scss">
.dashboard {
  max-width: $content-max-width;
  margin: 0 auto;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $sp-4;
  margin-bottom: $sp-6;
  flex-wrap: wrap;
}

.page-title {
  font-size: $fs-3xl;
  font-weight: $fw-bold;
  letter-spacing: -0.01em;
  margin-bottom: $sp-1;
}

.page-sub {
  color: $color-ink-2;
  font-size: $fs-md;
}

.page-actions {
  display: flex;
  gap: $sp-2;
}

// ============ KPI ============
.kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $sp-4;
  margin-bottom: $sp-6;
}

.kpi-card {
  @include card-base;
  padding: $sp-5;
  animation: kpi-in 0.5s $ease backwards;
  transition: box-shadow $dur-base $ease, transform $dur-base $ease;

  &:hover {
    box-shadow: $shadow-hover;
    transform: translateY(-2px);
  }
}

@keyframes kpi-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

.kpi-label {
  font-size: $fs-sm;
  color: $color-ink-2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: $fw-medium;
}

.kpi-value {
  font-size: $fs-4xl;
  font-weight: $fw-semibold;
  letter-spacing: -0.02em;
  font-family: $font-mono;
  font-feature-settings: 'tnum' on;
  margin: $sp-1 0;
  line-height: 1;
  transition: color $dur-base $ease;

  .num-flip.flash {
    color: $color-accent-ink;
  }
}

.kpi-unit {
  font-size: $fs-md;
  color: $color-ink-3;
  font-weight: $fw-regular;
  margin-left: $sp-1;
}

.kpi-delta {
  font-size: $fs-sm;
  color: $color-ink-2;

  .arrow {
    display: inline-block;
    width: 12px;
    margin-right: 2px;
  }

  &.up {
    color: #2b8a3e;
  }
  &.down {
    color: #c0392b;
  }
}

.spark {
  width: 100%;
  height: 24px;
  margin-top: $sp-3;
}

// ============ 双栏 ============
.two-col {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: $sp-4;
  margin-bottom: $sp-6;
}

.card {
  @include card-base;
  padding: $sp-5;
  margin-bottom: $sp-4;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $sp-4;

  h3 {
    font-size: $fs-md;
    font-weight: $fw-semibold;
  }
}

.energy-chart {
  height: 240px;
}

// ============ 活动流 ============
.feed {
  display: flex;
  flex-direction: column;
  max-height: 240px;
  overflow-y: auto;
}

.feed-row {
  display: flex;
  gap: $sp-3;
  padding: $sp-2 0;
  border-bottom: 1px solid $color-line;
  align-items: flex-start;

  &:last-child {
    border-bottom: none;
  }

  &.is-new {
    background: rgba(201, 100, 66, 0.05);
    border-radius: $radius-sm;
    padding-left: $sp-2;
    padding-right: $sp-2;
  }
}

.feed-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: $radius-full;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: $fw-bold;
  font-size: $fs-sm;
}

.feed-body {
  flex: 1;
  min-width: 0;
  font-size: $fs-base;
}

.feed-who {
  font-weight: $fw-semibold;
  margin-right: 4px;
}

.feed-action {
  color: $color-ink-2;
  margin-right: 4px;
}

.feed-target {
  color: $color-accent-ink;
  border-bottom: 1px dotted $color-accent;
}

.feed-time {
  font-size: $fs-sm;
  color: $color-ink-3;
  flex-shrink: 0;
  font-family: $font-mono;
}

@include respond-to('md') {
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
