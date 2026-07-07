<template>
  <div class="screen">
    <!-- 终端标题栏（CLI 美学，来自 deck-hermes-cyber） -->
    <header class="screen-head">
      <div class="terminal-chrome">
        <span class="dot red"></span>
        <span class="dot amber"></span>
        <span class="dot green"></span>
        <span class="prompt">$ smartpark.monitor --live</span>
      </div>
      <div class="head-right">
        <div class="pill-live"><span class="dot"></span> LIVE</div>
        <span class="clock mono">{{ clock }}</span>
      </div>
    </header>

    <!-- 主区 -->
    <main class="screen-body">
      <!-- KPI 行 -->
      <section class="kpi-row">
        <div v-for="(kpi, i) in kpis" :key="i" class="kpi-block">
          <div class="kpi-label">{{ kpi.label }}</div>
          <div class="kpi-value mono">
            {{ kpi.value }}<span class="unit">{{ kpi.unit }}</span>
          </div>
          <div class="kpi-trend" :class="kpi.trend">{{ kpi.delta }}</div>
        </div>
      </section>

      <!-- 中部：地图 + 趋势 -->
      <section class="mid-row">
        <div class="panel panel-map">
          <div class="panel-title">
            <span>// 园区分布</span>
            <span class="muted mono">N=6 sites</span>
          </div>
          <div class="map-grid">
            <div v-for="(p, i) in sites" :key="i" class="site" :style="p.style">
              <span class="site-pulse"></span>
              <span class="site-label mono">{{ p.name }} · {{ p.value }}</span>
            </div>
          </div>
        </div>

        <div class="panel panel-chart">
          <div class="panel-title">
            <span>// 能耗趋势 24h</span>
            <span class="muted mono">peak 480kWh @ 14:00</span>
          </div>
          <div ref="energyRef" class="chart"></div>
        </div>
      </section>

      <!-- 告警流（终端日志美学） -->
      <section class="panel log-panel">
        <div class="panel-title">
          <span>// 实时告警流</span>
          <span class="muted mono">{{ logs.length }} events</span>
        </div>
        <div class="log-stream">
          <div v-for="log in logs" :key="log.id" class="log-line mono" :class="log.level">
            <span class="log-time">[{{ log.time }}]</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-msg">{{ log.msg }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useECharts } from '@/composables/useECharts'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
// 记录进入大屏前的主题，离开时恢复（避免污染全局主题状态）
let previousTheme: 'light' | 'dark' = 'light'

const clock = ref('')
const energyRef = ref<HTMLElement | null>(null)
const energy = useECharts(energyRef, 'dark')

function updateClock() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  clock.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const kpis = ref([
  { label: '入驻企业', value: 238, unit: '家', delta: '+12 ▲', trend: 'up' },
  { label: '设备总数', value: 1820, unit: '台', delta: '+24 ▲', trend: 'up' },
  { label: '在线率', value: 99, unit: '%', delta: '+0.4 ▲', trend: 'up' },
  { label: '告警数', value: 4, unit: '条', delta: '-3 ▼', trend: 'down' },
  { label: '能耗', value: 480, unit: 'kWh', delta: 'peak', trend: 'flat' },
  { label: '巡检完成', value: 87, unit: '%', delta: '+5 ▲', trend: 'up' },
])

// 园区分布点（模拟坐标）
const sites = [
  { name: 'A区', value: 42, style: { top: '30%', left: '20%' } },
  { name: 'B区', value: 38, style: { top: '55%', left: '38%' } },
  { name: 'C区', value: 51, style: { top: '25%', left: '55%' } },
  { name: 'D区', value: 29, style: { top: '70%', left: '65%' } },
  { name: 'E区', value: 47, style: { top: '40%', left: '78%' } },
  { name: 'F区', value: 33, style: { top: '65%', left: '15%' } },
]

// 告警日志
const LOG_TEMPLATES = [
  { level: 'info', msg: '设备 #DEV-{id} 心跳正常' },
  { level: 'info', msg: '楼宇 BLD-{id} 巡检完成' },
  { level: 'warning', msg: '楼宇 BLD-{id} 温度异常 {t}°C' },
  { level: 'warning', msg: '设备 #DEV-{id} CPU 占用 {t}%' },
  { level: 'danger', msg: '!! 楼宇 BLD-{id} 烟雾报警 !!' },
  { level: 'info', msg: '新设备接入 #DEV-{id}' },
]
interface LogLine {
  id: number
  time: string
  level: 'info' | 'warning' | 'danger'
  msg: string
}
const logs = ref<LogLine[]>([])
let logId = 0

function pushLog() {
  const t = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  const msg = t.msg
    .replace('{id}', String(1000 + Math.floor(Math.random() * 9000)))
    .replace('{t}', String(20 + Math.floor(Math.random() * 20)))
  logs.value.unshift({ id: logId++, time, level: t.level as LogLine['level'], msg })
  if (logs.value.length > 20) logs.value.pop()
}

let timer: ReturnType<typeof setInterval> | null = null

function renderEnergy() {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = hours.map((_, i) => {
    // 模拟白天的能耗曲线
    const base = 200
    const peak = Math.exp(-Math.pow((i - 14) / 4, 2)) * 280
    return Math.round(base + peak + Math.random() * 40)
  })
  energy.setOption({
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: '#1f2733' } },
      axisLabel: { color: '#6e7681', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1f2733' } },
      axisLabel: { color: '#6e7681', fontSize: 10 },
    },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#7ed3a4' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(126,211,164,0.3)' },
              { offset: 1, color: 'rgba(126,211,164,0)' },
            ],
          },
        },
      },
    ],
  })
}

onMounted(() => {
  // 记录原主题，强制切到暗黑（大屏专用）
  previousTheme = appStore.theme
  appStore.setTheme('dark')
  updateClock()
  renderEnergy()
  // 初始填充 6 条日志
  for (let i = 0; i < 6; i++) pushLog()
  timer = setInterval(() => {
    updateClock()
    pushLog()
  }, 2500)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  // 恢复进入前的主题（避免污染全局主题状态）
  appStore.setTheme(previousTheme)
})
</script>

<style scoped lang="scss">
.screen {
  min-height: 100vh;
  background: $color-dark-bg;
  color: $color-dark-ink;
  font-family: $font-mono;
  position: relative;
  overflow: hidden;
}

// CRT 网格背景
.screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(126, 211, 164, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(126, 211, 164, 0.03) 1px, transparent 1px);
  background-size: 56px 56px;
  pointer-events: none;
}

// CRT 暗角
.screen::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
}

// ============ 标题栏 ============
.screen-head {
  position: relative;
  z-index: 2;
  padding: $sp-3 $sp-5;
  border-bottom: 1px solid $color-dark-line;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.terminal-chrome {
  display: flex;
  align-items: center;
  gap: $sp-2;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: $radius-full;
  display: inline-block;

  &.red {
    background: #ff5f57;
  }
  &.amber {
    background: #febc2e;
  }
  &.green {
    background: #28c840;
  }
}

.prompt {
  margin-left: $sp-3;
  color: $color-mint;
  font-size: $fs-sm;
}

.head-right {
  display: flex;
  align-items: center;
  gap: $sp-4;
}

.clock {
  color: $color-dark-ink;
  font-size: $fs-md;
  letter-spacing: 0.04em;
}

.pill-live {
  display: inline-flex;
  align-items: center;
  gap: $sp-1;
  padding: 2px $sp-2;
  border: 1px solid $color-mint;
  border-radius: $radius-full;
  font-size: $fs-sm;
  color: $color-mint;

  .dot {
    width: 6px;
    height: 6px;
    background: $color-mint;
    animation: pulse-dark 1.5s infinite;
  }
}

@keyframes pulse-dark {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

// ============ 主区 ============
.screen-body {
  position: relative;
  z-index: 2;
  padding: $sp-5;
}

// ============ KPI 行 ============
.kpi-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: $sp-3;
  margin-bottom: $sp-4;
}

.kpi-block {
  padding: $sp-4;
  border: 1px solid $color-dark-line;
  background: rgba(22, 27, 36, 0.6);
  backdrop-filter: blur(8px);
}

.kpi-label {
  font-size: $fs-xs;
  color: $color-dark-ink-3;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.kpi-value {
  font-size: $fs-4xl;
  font-weight: $fw-bold;
  color: $color-mint;
  line-height: 1.1;
  margin: $sp-1 0;
  letter-spacing: -0.02em;
  text-shadow: 0 0 12px rgba(126, 211, 164, 0.4);

  .unit {
    font-size: $fs-md;
    color: $color-dark-ink-2;
    margin-left: $sp-1;
  }
}

.kpi-trend {
  font-size: $fs-xs;
  color: $color-dark-ink-2;

  &.up {
    color: $color-mint;
  }
  &.down {
    color: $color-danger;
  }
}

// ============ 中部行 ============
.mid-row {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: $sp-3;
  margin-bottom: $sp-3;
}

.panel {
  border: 1px solid $color-dark-line;
  background: rgba(22, 27, 36, 0.4);
  padding: $sp-4;
  display: flex;
  flex-direction: column;
}

.panel-title {
  display: flex;
  justify-content: space-between;
  font-size: $fs-sm;
  color: $color-mint;
  margin-bottom: $sp-3;
  padding-bottom: $sp-2;
  border-bottom: 1px solid $color-dark-line;
}

.muted {
  color: $color-dark-ink-3;
}

// ============ 园区分布（伪地图） ============
.map-grid {
  flex: 1;
  position: relative;
  min-height: 240px;
  background: radial-gradient(circle at 50% 50%, rgba(59, 108, 255, 0.05), transparent 70%);
}

.site {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.site-pulse {
  width: 12px;
  height: 12px;
  border-radius: $radius-full;
  background: $color-mint;
  box-shadow: 0 0 0 0 rgba(126, 211, 164, 0.7);
  animation: site-pulse 2s infinite;
}

@keyframes site-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(126, 211, 164, 0.7);
  }
  70% {
    box-shadow: 0 0 0 14px rgba(126, 211, 164, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(126, 211, 164, 0);
  }
}

.site-label {
  font-size: $fs-xs;
  color: $color-dark-ink;
  background: rgba(10, 12, 16, 0.7);
  padding: 2px $sp-1;
  border-radius: $radius-xs;
}

.chart {
  flex: 1;
  height: 240px;
}

// ============ 日志流 ============
.log-panel {
  max-height: 280px;
}

.log-stream {
  flex: 1;
  overflow-y: auto;
  font-size: $fs-sm;
  line-height: 1.7;
}

.log-line {
  display: flex;
  gap: $sp-2;
  padding: 2px 0;
  animation: log-in 0.3s $ease backwards;

  &.info {
    color: $color-dark-ink-2;
  }
  &.warning {
    color: $color-amber;
  }
  &.danger {
    color: $color-danger;
  }
}

@keyframes log-in {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
}

.log-time {
  color: $color-dark-ink-3;
}

.log-level {
  width: 60px;
  flex-shrink: 0;
}

.log-msg {
  flex: 1;
}

// 响应式
@media (max-width: 1280px) {
  .kpi-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .mid-row {
    grid-template-columns: 1fr;
  }
}
</style>
