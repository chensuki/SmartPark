<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="title">菜单管理</h1>
        <p class="sub muted">查看系统所有菜单、目录与按钮权限标识</p>
      </div>
    </header>

    <div class="card">
      <div class="legend">
        <span class="legend-item"><span class="dot directory"></span>目录</span>
        <span class="legend-item"><span class="dot menu"></span>菜单</span>
        <span class="legend-item"><span class="dot button"></span>按钮权限</span>
      </div>

      <el-table
        :data="menuTree"
        row-key="id"
        :tree-props="{ children: 'children' }"
        :default-expand-all="true"
        border
      >
        <el-table-column prop="name" label="名称" min-width="260">
          <template #default="{ row }">
            <MenuIcon v-if="row.icon" :name="row.icon" :size="16" class="menu-icon" />
            <span class="menu-label">{{ row.name }}</span>
            <span v-if="row.icon" class="menu-icon-name mono muted">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="
                row.type === 'button' ? 'warning' : row.type === 'directory' ? 'info' : 'success'
              "
              size="small"
            >
              {{ typeText[row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" width="180">
          <template #default="{ row }">
            <span class="mono">{{ row.path || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件" width="180">
          <template #default="{ row }">
            <span class="mono muted">{{ row.component || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" width="180">
          <template #default="{ row }">
            <code v-if="row.permission" class="perm-code">{{ row.permission }}</code>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MENU_TREE } from '@/mock/rbac-data'
import type { MenuItem } from '@/types/rbac'

const menuTree = ref<MenuItem[]>(MENU_TREE)
const typeText: Record<string, string> = { directory: '目录', menu: '菜单', button: '按钮' }
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

.card {
  @include card-base;
  padding: $sp-5;
}

.legend {
  display: flex;
  gap: $sp-4;
  margin-bottom: $sp-4;
  font-size: $fs-sm;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: $sp-1;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: $radius-full;

  &.directory {
    background: #909399;
  }
  &.menu {
    background: #67c23a;
  }
  &.button {
    background: #e6a23c;
  }
}

// 用最朴素的 inline 元素 + margin，避免 flex 干扰 el-table 的树形缩进
// el-table 树形缩进是通过 .cell 的动态 padding-left 实现的，不能覆盖
.menu-icon {
  color: $color-ink-2;
  margin-right: $sp-2;
  vertical-align: middle;
}

.menu-label {
  font-weight: $fw-medium;
  vertical-align: middle;
}

.menu-icon-name {
  font-size: $fs-xs;
  background: $color-bg-soft;
  padding: 1px $sp-1;
  border-radius: $radius-xs;
  margin-left: $sp-2;
  vertical-align: middle;
}

.perm-code {
  font-family: $font-mono;
  font-size: $fs-xs;
  background: $color-bg-soft;
  padding: 2px $sp-2;
  border-radius: $radius-xs;
  color: $color-accent-ink;
}
</style>
