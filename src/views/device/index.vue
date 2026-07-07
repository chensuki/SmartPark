<template>
  <div class="page">
    <header class="page-head">
      <h1 class="title">设备监控</h1>
      <p class="sub muted">实时设备状态、健康度与历史数据</p>
    </header>

    <div class="stat-row">
      <div class="stat-card online">
        <div class="stat-num mono">{{ stats.online }}</div>
        <div class="stat-label">在线设备</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-num mono">{{ stats.warning }}</div>
        <div class="stat-label">告警设备</div>
      </div>
      <div class="stat-card offline">
        <div class="stat-num mono">{{ stats.offline }}</div>
        <div class="stat-label">离线设备</div>
      </div>
    </div>

    <div class="card">
      <el-table :data="devices" stripe>
        <el-table-column prop="id" label="设备ID" width="140" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="buildingName" label="所在楼宇" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="light">
              {{ statusText[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastHeartbeat" label="最后心跳" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Device } from '@/types/global'

const stats = ref({ online: 1804, warning: 12, offline: 4 })

const statusText: Record<string, string> = {
  online: '在线',
  warning: '告警',
  offline: '离线',
}
function statusType(s: string) {
  return s === 'online' ? 'success' : s === 'warning' ? 'warning' : 'info'
}

const devices = ref<Device[]>(
  Array.from({ length: 10 }, (_, i) => {
    const types = ['温湿度传感器', '智能电表', '门禁', '摄像头', '烟感']
    const buildings = ['研发楼1号', '生产楼2号', '办公A座', '仓储C区']
    const statuses = ['online', 'online', 'online', 'online', 'warning', 'offline'] as const
    const d = new Date(Date.now() - i * 60000)
    return {
      id: `DEV-${String(1000 + i).padStart(4, '0')}`,
      name: `${types[i % 5]} #${i + 1}`,
      type: types[i % 5],
      buildingId: `B-${i + 1}`,
      buildingName: buildings[i % 4],
      status: statuses[i % 6],
      lastHeartbeat: d.toLocaleString('zh-CN'),
    }
  }),
)
</script>

<style scoped lang="scss">
.page {
  max-width: $content-max-width;
  margin: 0 auto;
}

.page-head {
  margin-bottom: $sp-5;
}

.title {
  font-size: $fs-3xl;
  font-weight: $fw-bold;
  letter-spacing: -0.01em;
  margin-bottom: $sp-1;
}

.sub {
  font-size: $fs-md;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $sp-4;
  margin-bottom: $sp-5;
}

.stat-card {
  @include card-base;
  padding: $sp-5;
  border-left: 3px solid;

  &.online { border-left-color: #2b8a3e; }
  &.warning { border-left-color: $color-amber; }
  &.offline { border-left-color: $color-ink-3; }
}

.stat-num {
  font-size: $fs-4xl;
  font-weight: $fw-bold;
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-label {
  margin-top: $sp-1;
  color: $color-ink-2;
  font-size: $fs-sm;
}

.card {
  @include card-base;
  padding: $sp-5;
}
</style>
