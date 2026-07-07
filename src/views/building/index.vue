<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="title">楼宇资产</h1>
        <p class="sub muted">园区内所有楼宇的资产管理与入驻情况</p>
      </div>
      <el-button type="primary" v-permission="'building:add'">
        <el-icon><Plus /></el-icon>
        <span style="margin-left: 6px">新增楼宇</span>
      </el-button>
    </header>

    <!-- 搜索表单 -->
    <div class="card search-card">
      <el-form :model="table.query" inline>
        <el-form-item label="楼宇名称">
          <el-input v-model="table.query.keyword" placeholder="搜索楼宇名称/编码" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部" clearable style="width: 140px">
            <el-option label="在用" value="progress" />
            <el-option label="已满" value="done" />
            <el-option label="维护中" value="blocked" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="table.handleSearch()">
            <el-icon><Search /></el-icon><span style="margin-left:6px">查询</span>
          </el-button>
          <el-button @click="table.handleReset()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="card">
      <el-table :data="table.data.value" v-loading="table.loading.value" style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column prop="name" label="楼宇名称" min-width="160" />
        <el-table-column prop="floors" label="楼层" width="80" align="right" />
        <el-table-column prop="area" label="面积(㎡)" width="120" align="right">
          <template #default="{ row }">{{ row.area.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="入驻率" width="180">
          <template #default="{ row }">
            <el-progress
              :percentage="row.occupancy"
              :color="occupancyColor(row.occupancy)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status">{{ statusText[row.status] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="负责人" width="100" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="table.query.page"
          v-model:page-size="table.query.pageSize"
          :total="table.total.value"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="table.handlePageChange"
          @size-change="table.handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { useTable } from '@/composables/useTable'
import type { Building, PaginatedData, PageQuery } from '@/types/global'

const statusText: Record<string, string> = {
  done: '已满',
  progress: '在用',
  blocked: '维护中',
  todo: '空置',
  review: '审核中',
}

// 强类型的筛选状态（避免 PageQuery.status 是 unknown）
const statusFilter = ref<string>('')

function occupancyColor(v: number) {
  if (v >= 90) return '#c0392b'
  if (v >= 70) return '#c96442'
  if (v >= 40) return '#1f6e8c'
  return '#2b8a3e'
}

// Mock fetcher（实际项目应调用 api/building.ts）
interface BuildingQuery extends PageQuery {
  status?: string
}

async function fetchBuildings(query: BuildingQuery): Promise<PaginatedData<Building>> {
  await new Promise((r) => setTimeout(r, 300))
  const all: Building[] = Array.from({ length: 23 }, (_, i) => {
    const statuses = ['progress', 'done', 'blocked', 'todo'] as const
    const managers = ['张明', '李娜', '王强', '赵敏', '陈晨']
    return {
      id: `B-${String(i + 1).padStart(3, '0')}`,
      code: `BLD-${String(i + 1).padStart(3, '0')}`,
      name: `${['研发', '生产', '办公', '会议', '仓储'][i % 5]}楼 ${i + 1}号楼`,
      floors: 3 + (i % 12),
      area: 5000 + (i % 10) * 1200,
      occupancy: 20 + ((i * 7) % 80),
      status: statuses[i % 4],
      manager: managers[i % 5],
    }
  })
  // 模拟搜索
  let filtered = all
  if (query.keyword) {
    filtered = all.filter(
      (b) => b.name.includes(query.keyword!) || b.code.includes(query.keyword!),
    )
  }
  if (query.status) {
    filtered = filtered.filter((b) => b.status === query.status)
  }
  const total = filtered.length
  const start = (query.page - 1) * query.pageSize
  return {
    list: filtered.slice(start, start + query.pageSize),
    total,
    page: query.page,
    pageSize: query.pageSize,
  }
}

const table = useTable<Building>(fetchBuildings as (params: PageQuery) => Promise<PaginatedData<Building>>)

// 同步筛选状态到 query（empty string 视为不筛选）
watch(statusFilter, (v) => {
  table.query.status = v || undefined
})

table.refresh()
</script>

<style scoped lang="scss">
.page {
  max-width: $content-max-width;
  margin: 0 auto;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.card {
  @include card-base;
  padding: $sp-5;
  margin-bottom: $sp-4;
}

.search-card {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.status-pill {
  display: inline-block;
  padding: 2px $sp-2;
  border-radius: $radius-sm;
  font-size: $fs-sm;
  font-weight: $fw-medium;

  &.progress {
    @include status-pill($color-progress-bg, $color-progress-ink);
  }
  &.done {
    @include status-pill($color-done-bg, $color-done-ink);
  }
  &.blocked {
    @include status-pill($color-blocked-bg, $color-blocked-ink);
  }
  &.todo {
    @include status-pill($color-todo-bg, $color-todo-ink);
  }
  &.review {
    @include status-pill($color-review-bg, $color-review-ink);
  }
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: $sp-4;
}
</style>
