<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="title">供应链库存</h1>
        <p class="sub muted">园区设备物资管理、出入库流转与供应商档案</p>
      </div>
    </header>

    <!-- 统计卡片 -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label muted">物资种类</div>
        <div class="stat-value mono">{{ stats.total }}</div>
      </div>
      <div class="stat-card warn">
        <div class="stat-label muted">库存预警</div>
        <div class="stat-value mono">{{ stats.lowCount }}</div>
        <div class="stat-hint">低于安全线</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label muted">缺货</div>
        <div class="stat-value mono">{{ stats.outCount }}</div>
        <div class="stat-hint danger-text">需立即补货</div>
      </div>
      <div class="stat-card">
        <div class="stat-label muted">库存总值</div>
        <div class="stat-value mono">
          ¥{{ (stats.totalValue / 10000).toFixed(1) }}<span class="unit">万</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" class="content-tabs">
      <!-- ============ 库存清单 ============ -->
      <el-tab-pane label="库存清单" name="stock">
        <div class="card">
          <el-form :model="stockFilters" inline>
            <el-form-item label="关键词">
              <el-input
                v-model="stockFilters.keyword"
                placeholder="物资名 / SKU"
                clearable
                style="width: 180px"
                @keyup.enter="searchStock"
              />
            </el-form-item>
            <el-form-item label="分类">
              <el-select
                v-model="stockFilters.category"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option v-for="(l, v) in categoryText" :key="v" :label="l" :value="v" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select
                v-model="stockFilters.status"
                placeholder="全部"
                clearable
                style="width: 120px"
              >
                <el-option v-for="(l, v) in statusText" :key="v" :label="l" :value="v" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchStock">查询</el-button>
              <el-button @click="resetStock">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table v-loading="stockTable.loading.value" :data="stockTable.data.value">
            <el-table-column prop="sku" label="SKU" width="110" class-name="mono-cell" />
            <el-table-column prop="name" label="物资名称" min-width="180" />
            <el-table-column label="分类" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{
                  categoryText[row.category as MaterialCategory]
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="库存/安全线" width="160">
              <template #default="{ row }">
                <span class="mono" :class="{ 'danger-text': row.quantity < row.safetyStock }">
                  {{ row.quantity }}
                </span>
                <span class="muted"> / {{ row.safetyStock }} {{ row.unit }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <span class="stock-status" :class="row.status">{{
                  statusText[row.status as StockStatus]
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="100" align="right">
              <template #default="{ row }">
                <span class="mono">¥{{ row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="warehouse" label="仓库" width="80" />
            <el-table-column prop="supplierName" label="供应商" width="120" show-overflow-tooltip />
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="success" size="small" @click="openMove(row as any, 'in')"
                  >入库</el-button
                >
                <el-button
                  link
                  type="warning"
                  size="small"
                  :disabled="row.quantity === 0"
                  @click="openMove(row as any, 'out')"
                >
                  出库
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pager">
            <el-pagination
              v-model:current-page="stockTable.query.page"
              v-model:page-size="stockTable.query.pageSize"
              :total="stockTable.total.value"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              background
              @current-change="stockTable.handlePageChange"
              @size-change="stockTable.handleSizeChange"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- ============ 出入库记录 ============ -->
      <el-tab-pane label="出入库记录" name="moves">
        <div class="card">
          <div class="moves-toolbar">
            <el-radio-group v-model="moveTypeFilter" size="small" @change="searchMoves">
              <el-radio-button value="">全部</el-radio-button>
              <el-radio-button value="in">入库</el-radio-button>
              <el-radio-button value="out">出库</el-radio-button>
            </el-radio-group>
          </div>
          <el-table v-loading="moveTable.loading.value" :data="moveTable.data.value">
            <el-table-column prop="createdAt" label="时间" width="180" />
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <span class="move-type" :class="row.type">{{
                  moveTypeText[row.type as StockMoveType]
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="materialName"
              label="物资"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column label="数量" width="100" align="right">
              <template #default="{ row }">
                <span class="mono" :class="row.type === 'in' ? 'success-text' : 'danger-text'">
                  {{ row.type === 'in' ? '+' : '-' }}{{ row.quantity }} {{ row.unit }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="库存余量" width="120" align="right">
              <template #default="{ row }">
                <span class="mono muted">{{ row.balance }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作人" width="100" />
            <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
          </el-table>
          <div class="pager">
            <el-pagination
              v-model:current-page="moveTable.query.page"
              v-model:page-size="moveTable.query.pageSize"
              :total="moveTable.total.value"
              :page-sizes="[10, 20, 50]"
              layout="total, prev, pager, next"
              background
              @current-change="moveTable.handlePageChange"
              @size-change="moveTable.handleSizeChange"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- ============ 供应商 ============ -->
      <el-tab-pane label="供应商档案" name="suppliers">
        <div class="card">
          <div class="supplier-grid">
            <div v-for="s in suppliers" :key="s.id" class="supplier-card">
              <div class="sup-head">
                <div class="sup-avatar">{{ s.name.charAt(0) }}</div>
                <div class="sup-info">
                  <div class="sup-name">{{ s.name }}</div>
                  <div class="sup-contact muted">{{ s.contact }} · {{ s.phone }}</div>
                </div>
                <div class="sup-level" :class="s.level">{{ s.level.toUpperCase() }}</div>
              </div>
              <div class="sup-meta">
                <div class="sup-meta-item">
                  <span class="muted">供货品类</span>
                  <span class="mono">{{ s.materialCount }}</span>
                </div>
                <div class="sup-meta-item">
                  <span class="muted">状态</span>
                  <span :class="s.status === 'enabled' ? 'success-text' : 'muted'">
                    {{ s.status === 'enabled' ? '合作中' : '已停用' }}
                  </span>
                </div>
                <div class="sup-meta-item">
                  <span class="muted">建档</span>
                  <span class="mono">{{ s.createdAt }}</span>
                </div>
              </div>
              <div v-if="s.email" class="sup-email muted">{{ s.email }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 出入库弹窗 -->
    <el-dialog
      v-model="moveDialogVisible"
      :title="moveForm.type === 'in' ? '物资入库' : '物资出库'"
      width="420px"
    >
      <div v-if="moveForm.stock" class="move-target">
        <strong>{{ moveForm.stock.name }}</strong>
        <span class="muted">（{{ moveForm.stock.sku }}）</span>
        <span class="muted">当前库存: {{ moveForm.stock.quantity }} {{ moveForm.stock.unit }}</span>
      </div>
      <el-form :model="moveForm" label-width="80px" style="margin-top: 16px">
        <el-form-item label="数量" required>
          <el-input-number
            v-model="moveForm.quantity"
            :min="1"
            :max="moveForm.type === 'out' ? moveForm.stock?.quantity : 9999"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="moveForm.remark" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="moving" @click="handleMove"
          >确认{{ moveForm.type === 'in' ? '入库' : '出库' }}</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable } from '@/composables/useTable'
import {
  getStockList,
  getStockStats,
  moveStock,
  getMoveList,
  getSupplierList,
  type StockQuery,
  type MoveQuery,
} from '@/api/supply'
import type {
  StockItem,
  Supplier,
  MaterialCategory,
  StockStatus,
  StockMoveType,
} from '@/types/supply'

const activeTab = ref<'stock' | 'moves' | 'suppliers'>('stock')

const categoryText: Record<MaterialCategory, string> = {
  equipment: '设备',
  consumable: '耗材',
  spare: '备件',
  other: '其他',
}
const statusText: Record<StockStatus, string> = {
  sufficient: '充足',
  low: '偏低',
  warning: '紧张',
  out: '缺货',
}
const moveTypeText: Record<StockMoveType, string> = {
  in: '入库',
  out: '出库',
  adjust: '调整',
}

// ============ 统计 ============
const stats = reactive({ total: 0, lowCount: 0, outCount: 0, totalValue: 0 })
async function loadStats() {
  const d = await getStockStats()
  Object.assign(stats, d)
}

// ============ 库存列表 ============
const stockFilters = reactive<{ keyword: string; category: string; status: string }>({
  keyword: '',
  category: '',
  status: '',
})
const stockTable = useTable<StockItem & { status: StockStatus }, StockQuery>(getStockList, {
  page: 1,
  pageSize: 10,
})

function searchStock() {
  stockTable.query.keyword = stockFilters.keyword || undefined
  stockTable.query.category = (stockFilters.category || undefined) as MaterialCategory | undefined
  stockTable.query.status = (stockFilters.status || undefined) as StockStatus | undefined
  stockTable.handleSearch()
}
function resetStock() {
  stockFilters.keyword = ''
  stockFilters.category = ''
  stockFilters.status = ''
  searchStock()
}

// ============ 出入库 ============
const moveDialogVisible = ref(false)
const moving = ref(false)
const moveForm = reactive<{
  stock: (StockItem & { status: StockStatus }) | null
  type: 'in' | 'out'
  quantity: number
  remark: string
}>({
  stock: null,
  type: 'in',
  quantity: 1,
  remark: '',
})

function openMove(row: StockItem & { status: StockStatus }, type: 'in' | 'out') {
  moveForm.stock = row
  moveForm.type = type
  moveForm.quantity = 1
  moveForm.remark = ''
  moveDialogVisible.value = true
}

async function handleMove() {
  if (!moveForm.stock) return
  moving.value = true
  try {
    await moveStock({
      id: moveForm.stock.id,
      type: moveForm.type,
      quantity: moveForm.quantity,
      remark: moveForm.remark,
    })
    ElMessage.success(`${moveForm.type === 'in' ? '入库' : '出库'}成功`)
    moveDialogVisible.value = false
    stockTable.refresh()
    loadStats()
  } finally {
    moving.value = false
  }
}

// ============ 出入库记录 ============
const moveTypeFilter = ref('')
const moveTable = useTable(getMoveList, { page: 1, pageSize: 10 } as MoveQuery)
function searchMoves() {
  moveTable.query.type = (moveTypeFilter.value || undefined) as StockMoveType | undefined
  moveTable.handleSearch()
}

// ============ 供应商 ============
const suppliers = ref<Supplier[]>([])

onMounted(async () => {
  await Promise.all([loadStats(), stockTable.refresh(), moveTable.refresh()])
  suppliers.value = await getSupplierList()
})
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

// 统计
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $sp-4;
  margin-bottom: $sp-5;
}

.stat-card {
  @include card-base;
  padding: $sp-4 $sp-5;
  border-left: 3px solid $color-accent;

  &.warn {
    border-left-color: $color-amber;
  }
  &.danger {
    border-left-color: #c0392b;
  }
}

.stat-label {
  font-size: $fs-sm;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: $fs-4xl;
  font-weight: $fw-bold;
  letter-spacing: -0.02em;
  margin-top: $sp-1;
  line-height: 1;

  .unit {
    font-size: $fs-md;
    color: $color-ink-3;
    margin-left: 2px;
  }
}

.stat-hint {
  font-size: $fs-xs;
  color: $color-ink-3;
  margin-top: $sp-1;

  &.danger-text {
    color: #c0392b;
  }
}

.danger-text {
  color: #c0392b;
}
.success-text {
  color: #2b8a3e;
}

.content-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: $sp-4;
  }
}

.card {
  @include card-base;
  padding: $sp-5;
}

:deep(.mono-cell) {
  font-family: $font-mono;
  font-size: $fs-sm;
}

// 状态徽章
.stock-status {
  display: inline-block;
  padding: 2px $sp-2;
  border-radius: $radius-sm;
  font-size: $fs-xs;
  font-weight: $fw-medium;

  &.sufficient {
    background: #dbeddb;
    color: #2b593f;
  }
  &.low {
    background: #fdecc8;
    color: #976d23;
  }
  &.warning {
    background: #ffe2dd;
    color: #b13b2c;
  }
  &.out {
    background: #c0392b;
    color: #fff;
  }
}

.move-type {
  display: inline-block;
  padding: 2px $sp-2;
  border-radius: $radius-sm;
  font-size: $fs-xs;
  font-weight: $fw-medium;

  &.in {
    background: #dbeddb;
    color: #2b593f;
  }
  &.out {
    background: #ffe2dd;
    color: #b13b2c;
  }
}

// 供应商
.supplier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $sp-4;
}

.supplier-card {
  border: 1px solid $color-line;
  border-radius: $radius-md;
  padding: $sp-4;
  transition: box-shadow $dur-base $ease;

  &:hover {
    box-shadow: $shadow-hover;
  }
}

.sup-head {
  display: flex;
  align-items: center;
  gap: $sp-3;
  margin-bottom: $sp-3;
}

.sup-avatar {
  width: 40px;
  height: 40px;
  border-radius: $radius-md;
  background: linear-gradient(135deg, #1f6e8c, #15506b);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: $fw-bold;
  flex-shrink: 0;
}

.sup-info {
  flex: 1;
  min-width: 0;
}

.sup-name {
  font-weight: $fw-semibold;
}

.sup-contact {
  font-size: $fs-sm;
}

.sup-level {
  font-size: $fs-xs;
  font-weight: $fw-bold;
  padding: 2px $sp-2;
  border-radius: $radius-sm;

  &.a {
    background: #dbeddb;
    color: #2b593f;
  }
  &.b {
    background: #fdecc8;
    color: #976d23;
  }
  &.c {
    background: $color-bg-soft;
    color: $color-ink-2;
  }
}

.sup-meta {
  display: flex;
  justify-content: space-between;
  padding: $sp-2 0;
  border-top: 1px solid $color-line;
  font-size: $fs-sm;
}

.sup-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sup-email {
  font-size: $fs-xs;
  margin-top: $sp-1;
}

// 出入库弹窗
.move-target {
  background: $color-bg-soft;
  padding: $sp-3;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  gap: $sp-2;
  flex-wrap: wrap;
}

.moves-toolbar {
  margin-bottom: $sp-4;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: $sp-4;
}
</style>
