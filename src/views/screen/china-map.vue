<template>
  <div class="map-screen">
    <header class="ms-head">
      <div class="ms-title">
        <span class="dot"></span>
        <span>全国园区分布监控</span>
        <span v-if="mapReady" class="muted mono">· 地图已加载</span>
        <span v-else class="muted mono">· 加载地图中…</span>
      </div>
      <div class="ms-legend">
        <span class="leg-item"><span class="leg-dot low"></span>正常 (&lt;30)</span>
        <span class="leg-item"><span class="leg-dot mid"></span>繁忙 (30-60)</span>
        <span class="leg-item"><span class="leg-dot high"></span>高负荷 (&gt;60)</span>
      </div>
    </header>

    <div class="ms-body">
      <!-- 地图主区 -->
      <div ref="mapRef" v-loading="!mapReady" class="map-chart"></div>

      <!-- 右侧统计 -->
      <aside class="ms-side">
        <div class="side-card">
          <div class="side-title">区域 TOP 5</div>
          <div class="region-list">
            <div v-for="(r, i) in topRegions" :key="r.name" class="region-row">
              <span class="rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
              <span class="region-name">{{ r.name }}</span>
              <div class="region-bar">
                <div
                  class="region-fill"
                  :style="{
                    width: (r.value / maxRegion) * 100 + '%',
                    background: regionColor(r.value),
                  }"
                ></div>
              </div>
              <span class="region-val mono">{{ r.value }}</span>
            </div>
          </div>
        </div>

        <div class="side-card">
          <div class="side-title">设备类型分布</div>
          <div ref="pieRef" class="pie-chart"></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useECharts, registerChinaMap, echarts } from '@/composables/useECharts'

const mapRef = ref<HTMLElement | null>(null)
const pieRef = ref<HTMLElement | null>(null)
const mapReady = ref(false)

const map = useECharts(mapRef, 'light')
const pie = useECharts(pieRef, 'light')

// 园区数据（经纬度 + 负荷值）
interface ParkPoint {
  name: string
  value: number
  coord: [number, number]
}
const parks: ParkPoint[] = [
  { name: '北京园区', value: 48, coord: [116.4, 39.9] },
  { name: '上海园区', value: 72, coord: [121.47, 31.23] },
  { name: '深圳园区', value: 65, coord: [114.05, 22.52] },
  { name: '杭州园区', value: 38, coord: [120.15, 30.28] },
  { name: '成都园区', value: 42, coord: [104.07, 30.57] },
  { name: '武汉园区', value: 28, coord: [114.3, 30.6] },
  { name: '西安园区', value: 35, coord: [108.95, 34.27] },
  { name: '广州园区', value: 55, coord: [113.27, 23.13] },
  { name: '南京园区', value: 31, coord: [118.78, 32.07] },
  { name: '重庆园区', value: 44, coord: [106.55, 29.56] },
  { name: '苏州园区', value: 52, coord: [120.62, 31.32] },
  { name: '天津园区', value: 26, coord: [117.2, 39.13] },
]

const topRegions = computed(() => [...parks].sort((a, b) => b.value - a.value).slice(0, 5))
const maxRegion = computed(() => Math.max(...parks.map((p) => p.value)))

function regionColor(v: number) {
  if (v > 60) return '#c0392b'
  if (v > 30) return '#c96442'
  return '#2b8a3e'
}

async function renderMap() {
  const ok = await registerChinaMap()
  mapReady.value = true
  if (!ok) return

  const scatterData = parks.map((p) => ({
    name: p.name,
    value: [...p.coord, p.value],
  }))

  map.setOption({
    backgroundColor: '#fafaf9',
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}<br/>负荷值: <b>${p.value?.[2] ?? p.value}</b>`,
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      itemStyle: {
        areaColor: '#f0ece5',
        borderColor: '#d3d1cb',
        borderWidth: 0.6,
      },
      emphasis: {
        itemStyle: { areaColor: '#faf0eb', borderColor: '#c96442' },
        label: { color: '#37352f' },
      },
    },
    series: [
      {
        name: '园区分布',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: (val: number[]) => Math.max(8, val[2] / 4),
        tooltip: {
          formatter: (p: any) => `${p.data.name}<br/>负荷值: <b>${p.data.value[2]}</b>`,
        },
        itemStyle: {
          color: (p: any) => regionColor(p.data.value[2]),
          shadowBlur: 10,
          shadowColor: 'rgba(201,100,66,0.3)',
        },
        label: {
          show: true,
          formatter: '{@[2]}',
          position: 'right',
          fontSize: 10,
          color: '#37352f',
        },
      },
      // 飞线效果（从北京到其他园区）
      {
        name: '调度链路',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [{ name: '北京园区', value: [116.4, 39.9, 48] }],
        symbolSize: 12,
        rippleEffect: { brushType: 'stroke', period: 3 },
        itemStyle: { color: '#c96442' },
        zlevel: 2,
      },
    ],
  } as any)
}

function renderPie() {
  pie.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    // 关键：图例固定在底部，高度约 40px，饼图区域要避开这部分
    legend: {
      bottom: 0,
      textStyle: { fontSize: 11, color: '#787774' },
      itemWidth: 10,
      itemHeight: 10,
    },
    // 给图例预留空间：grid top=10, bottom=50（图例区）
    grid: { top: 10, bottom: 50, left: 'center' },
    series: [
      {
        type: 'pie',
        // 关键修复：缩小半径 + 上移中心，防止饼图底边侵入图例区
        radius: ['35%', '55%'],
        center: ['50%', '38%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: [
          { value: 480, name: '温湿度传感器', itemStyle: { color: '#c96442' } },
          { value: 320, name: '智能电表', itemStyle: { color: '#1f6e8c' } },
          { value: 280, name: '门禁', itemStyle: { color: '#2b593f' } },
          { value: 380, name: '摄像头', itemStyle: { color: '#976d23' } },
          { value: 180, name: '烟感', itemStyle: { color: '#b13b2c' } },
        ],
      },
    ],
  })
}

onMounted(async () => {
  // 关键：等 grid 布局计算完成后再渲染图表，防止容器尺寸未确定导致重叠
  await nextTick()
  await renderMap()
  renderPie()
})

// 防止 echarts 实例类型告警（_echarts 占位）
void echarts
</script>

<style scoped lang="scss">
.map-screen {
  background: #fafaf9;
  border-radius: $radius-lg;
  padding: $sp-5;
  min-height: 600px;
}

.ms-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $sp-4;
  flex-wrap: wrap;
  gap: $sp-3;
}

.ms-title {
  display: flex;
  align-items: center;
  gap: $sp-2;
  font-size: $fs-lg;
  font-weight: $fw-semibold;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: $radius-full;
  background: $color-accent;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.ms-legend {
  display: flex;
  gap: $sp-4;
  font-size: $fs-sm;
  color: $color-ink-2;
}

.leg-item {
  display: flex;
  align-items: center;
  gap: $sp-1;
}

.leg-dot {
  width: 10px;
  height: 10px;
  border-radius: $radius-full;

  &.low {
    background: #2b8a3e;
  }
  &.mid {
    background: #c96442;
  }
  &.high {
    background: #c0392b;
  }
}

.ms-body {
  display: grid;
  grid-template-columns: 1fr 320px;
  // 关键：让左右两侧顶部对齐，且各自独立不溢出
  align-items: start;
  gap: $sp-4;
}

.map-chart {
  height: 560px;
  background: #fff;
  border: 1px solid $color-line;
  border-radius: $radius-md;
  overflow: hidden; // 防止 ECharts 地图缩放时溢出
}

.ms-side {
  display: flex;
  flex-direction: column;
  gap: $sp-3;
  // 关键：右侧高度封顶，超出滚动而非溢出重叠
  max-height: 560px;
  overflow-y: auto;
}

.side-card {
  background: #fff;
  border: 1px solid $color-line;
  border-radius: $radius-md;
  padding: $sp-4;
  // 关键：card 内容独立布局，不溢出到相邻 card
  flex-shrink: 0;
  overflow: hidden;
}

.side-title {
  font-size: $fs-sm;
  font-weight: $fw-semibold;
  color: $color-ink-2;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: $sp-3;
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: $sp-2;
}

.region-row {
  display: flex;
  align-items: center;
  gap: $sp-2;
  // 关键：固定行高，防止进度条/徽章高度不一导致行间挤压
  height: 24px;
  font-size: $fs-sm;
}

.rank {
  width: 20px;
  height: 20px;
  border-radius: $radius-full;
  background: $color-bg-soft;
  color: $color-ink-2;
  display: grid;
  place-items: center;
  font-size: $fs-xs;
  font-weight: $fw-bold;
  flex-shrink: 0;

  &.top {
    background: $color-accent;
    color: #fff;
  }
}

.region-name {
  flex-shrink: 0;
  width: 80px;
  @include text-ellipsis(1);
}

.region-bar {
  flex: 1;
  height: 8px;
  background: $color-bg-soft;
  border-radius: $radius-full;
  overflow: hidden;
}

.region-fill {
  height: 100%;
  border-radius: $radius-full;
  transition: width 0.8s $ease;
}

.region-val {
  width: 30px;
  text-align: right;
  font-size: $fs-sm;
  color: $color-ink;
  font-weight: $fw-medium;
}

.pie-chart {
  // 加高容器，给饼图和图例各自充足空间
  height: 240px;
}

@media (max-width: 1100px) {
  .ms-body {
    grid-template-columns: 1fr;
  }
}
</style>
