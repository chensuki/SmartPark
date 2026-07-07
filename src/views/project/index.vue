<template>
  <div class="board-page">
    <!-- 页头 -->
    <header class="page-head">
      <div>
        <h1 class="title">项目协作看板</h1>
        <p class="sub muted">
          园区运营任务流转 · 共 {{ totalCount }} 个任务 ·
          <span class="accent">拖拽卡片可跨列移动</span>
        </p>
      </div>
      <div class="head-actions">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="board">看板</el-radio-button>
          <el-radio-button value="list">列表</el-radio-button>
        </el-radio-group>
        <el-button v-permission="'project:add'" type="primary" @click="openCreate">
          <el-icon><Plus /></el-icon><span style="margin-left: 6px">新建任务</span>
        </el-button>
      </div>
    </header>

    <!-- 看板视图 -->
    <div v-if="viewMode === 'board'" class="board">
      <div
        v-for="col in columns"
        :key="col.status"
        class="column"
        :style="{ '--col-color': col.color }"
      >
        <div class="col-head">
          <span class="col-dot"></span>
          <span class="col-title">{{ col.title }}</span>
          <span class="col-count">{{ col.tasks.length }}</span>
        </div>

        <draggable
          v-model="col.tasks"
          :group="{ name: 'tasks', pull: true, put: true }"
          item-key="id"
          ghost-class="task-ghost"
          drag-class="task-dragging"
          animation="200"
          class="col-body"
          @end="(evt) => onDragEnd(evt, col.status)"
        >
          <template #item="{ element }">
            <div class="task-card" @click="openDetail(element)">
              <div class="task-priority" :class="element.priority"></div>
              <div class="task-title">{{ element.title }}</div>
              <div v-if="element.tags?.length" class="task-tags">
                <span v-for="tag in element.tags" :key="tag" class="task-tag">{{ tag }}</span>
              </div>
              <div
                v-if="element.progress !== undefined && element.progress > 0"
                class="task-progress"
              >
                <el-progress :percentage="element.progress" :show-text="false" :stroke-width="4" />
              </div>
              <div class="task-foot">
                <div class="task-meta">
                  <span
                    v-if="element.dueDate"
                    class="meta-item"
                    :class="{ overdue: isOverdue(element.dueDate) }"
                  >
                    <el-icon><Calendar /></el-icon>{{ element.dueDate.slice(5) }}
                  </span>
                  <span v-if="element.commentCount" class="meta-item">
                    <el-icon><ChatDotRound /></el-icon>{{ element.commentCount }}
                  </span>
                  <span v-if="element.attachmentCount" class="meta-item">
                    <el-icon><Paperclip /></el-icon>{{ element.attachmentCount }}
                  </span>
                </div>
                <div
                  v-if="element.assignee"
                  class="task-assignee"
                  :style="{ background: element.assigneeColor }"
                  :title="element.assignee"
                >
                  {{ element.assignee.charAt(0) }}
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- 列表视图 -->
    <div v-else class="card list-view">
      <el-table :data="allTasks" stripe>
        <el-table-column prop="title" label="任务标题" min-width="240" />
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <span class="priority-badge" :class="row.priority">{{
              priorityText[row.priority as Priority]
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-badge" :class="row.status">{{
              statusText[row.status as TaskStatus]
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="assignee" label="负责人" width="100" />
        <el-table-column prop="dueDate" label="截止日期" width="120" />
        <el-table-column label="进度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" :stroke-width="6" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 任务详情抽屉 -->
    <el-drawer v-model="detailVisible" size="420px" :title="currentTask?.title || '任务详情'">
      <template v-if="currentTask">
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">状态</span>
            <el-select v-model="currentTask.status" size="small" @change="onStatusChange">
              <el-option
                v-for="s in statusOptions"
                :key="s.value"
                :label="s.label"
                :value="s.value"
              />
            </el-select>
          </div>
          <div class="detail-row">
            <span class="detail-label">优先级</span>
            <span class="priority-badge" :class="currentTask.priority">
              {{ priorityText[currentTask.priority] }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">负责人</span>
            <span>{{ currentTask.assignee }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">截止日期</span>
            <span>{{ currentTask.dueDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">进度</span>
            <el-slider v-model="currentTask.progress" :step="10" style="flex: 1; margin: 0 12px" />
            <span class="mono">{{ currentTask.progress }}%</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">描述</div>
          <p class="detail-desc">{{ currentTask.description || '暂无描述。点击下方编辑添加。' }}</p>
        </div>

        <div class="detail-section">
          <div class="detail-label">标签</div>
          <div v-if="currentTask.tags?.length" class="task-tags">
            <span v-for="tag in currentTask.tags" :key="tag" class="task-tag">{{ tag }}</span>
          </div>
          <span v-else class="muted">无</span>
        </div>

        <div class="detail-actions">
          <el-button @click="openEdit">
            <el-icon><Edit /></el-icon><span style="margin-left: 6px">编辑</span>
          </el-button>
          <el-button v-permission="'project:add'" type="danger" plain @click="handleDelete">
            <el-icon><Delete /></el-icon><span style="margin-left: 6px">删除</span>
          </el-button>
        </div>
      </template>
    </el-drawer>

    <!-- 新建/编辑弹窗 -->
    <el-dialog v-model="formVisible" :title="editing.id ? '编辑任务' : '新建任务'" width="520px">
      <el-form :model="editing" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="editing.title" placeholder="任务标题" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editing.status" style="width: 100%">
            <el-option
              v-for="s in statusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editing.priority" style="width: 100%">
            <el-option
              v-for="p in priorityOptions"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="editing.assignee" placeholder="负责人姓名" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="editing.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editing.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import draggable from 'vuedraggable'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Calendar, ChatDotRound, Paperclip, Edit, Delete } from '@element-plus/icons-vue'
import { getTasks, saveTask, moveTask, deleteTask } from '@/api/project'
import type { Task, TaskStatus, Priority, BoardColumn } from '@/types/project'

const viewMode = ref<'board' | 'list'>('board')
const allTasks = ref<Task[]>([])
const loading = ref(false)
const saving = ref(false)

const statusText: Record<TaskStatus, string> = {
  todo: '待办',
  progress: '进行中',
  review: '待评审',
  done: '已完成',
}
const priorityText: Record<Priority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
}

const statusOptions = Object.entries(statusText).map(([value, label]) => ({
  value: value as TaskStatus,
  label,
}))
const priorityOptions = Object.entries(priorityText).map(([value, label]) => ({
  value: value as Priority,
  label,
}))

// 看板列（响应式，支持拖拽排序）
const columns = ref<BoardColumn[]>([
  { status: 'todo', title: '待办', color: '#787774', tasks: [] },
  { status: 'progress', title: '进行中', color: '#2eaadc', tasks: [] },
  { status: 'review', title: '待评审', color: '#e67e22', tasks: [] },
  { status: 'done', title: '已完成', color: '#2b8a3e', tasks: [] },
])

const totalCount = computed(() => allTasks.value.length)

function groupByStatus(tasks: Task[]) {
  columns.value.forEach((col) => {
    col.tasks = tasks.filter((t) => t.status === col.status)
  })
}

async function loadTasks() {
  loading.value = true
  try {
    const data = await getTasks()
    allTasks.value = data
    groupByStatus(data)
  } finally {
    loading.value = false
  }
}

// 拖拽结束：同步状态到后端
async function onDragEnd(evt: any, toStatus: TaskStatus) {
  const taskId = evt.item?.dataset?.id || evt.item?._underlying_vm_?.id
  if (!taskId) return
  const toIndex = evt.newIndex
  try {
    await moveTask(taskId, toStatus, toIndex)
    // 同步本地 allTasks
    const task = allTasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = toStatus
      if (toStatus === 'done') task.progress = 100
      else if (toStatus === 'progress' && !task.progress) task.progress = 10
    }
    ElMessage.success(`已移至「${statusText[toStatus]}」`)
  } catch (e) {
    console.error(e)
    // 失败回滚
    await loadTasks()
  }
}

function isOverdue(date?: string) {
  if (!date) return false
  return new Date(date) < new Date()
}

// ============ 详情抽屉 ============
const detailVisible = ref(false)
const currentTask = ref<Task | null>(null)

function openDetail(task: Task) {
  currentTask.value = { ...task }
  detailVisible.value = true
}

async function onStatusChange(status: TaskStatus) {
  if (!currentTask.value) return
  await moveTask(currentTask.value.id, status, 0)
  const original = allTasks.value.find((t) => t.id === currentTask.value!.id)
  if (original) {
    original.status = status
    groupByStatus(allTasks.value)
  }
}

function openEdit() {
  if (!currentTask.value) return
  Object.assign(editing, currentTask.value)
  formVisible.value = true
}

// ============ 新建/编辑 ============
const formVisible = ref(false)
const editing = reactive<Partial<Task>>({
  title: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  dueDate: '',
  description: '',
})

function openCreate() {
  Object.assign(editing, {
    id: undefined,
    title: '',
    status: 'todo',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    description: '',
  })
  formVisible.value = true
}

async function handleSave() {
  if (!editing.title) {
    ElMessage.warning('请输入任务标题')
    return
  }
  saving.value = true
  try {
    await saveTask({ ...editing })
    ElMessage.success(editing.id ? '更新成功' : '创建成功')
    formVisible.value = false
    detailVisible.value = false
    await loadTasks()
  } finally {
    saving.value = false
  }
}

function handleDelete() {
  if (!currentTask.value) return
  ElMessageBox.confirm(`确认删除任务「${currentTask.value.title}」？`, '删除确认', {
    type: 'warning',
  })
    .then(async () => {
      await deleteTask(currentTask.value!.id)
      ElMessage.success('删除成功')
      detailVisible.value = false
      await loadTasks()
    })
    .catch(() => {})
}

onMounted(loadTasks)
</script>

<style scoped lang="scss">
.board-page {
  max-width: 100%;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $sp-5;
  flex-wrap: wrap;
  gap: $sp-3;
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

.head-actions {
  display: flex;
  gap: $sp-3;
  align-items: center;
}

// ============ 看板 ============
.board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $sp-4;
  align-items: start;
}

.column {
  background: $color-bg-soft;
  border-radius: $radius-lg;
  padding: $sp-3;
  border-top: 3px solid var(--col-color);
}

.col-head {
  display: flex;
  align-items: center;
  gap: $sp-2;
  padding: $sp-1 $sp-2 $sp-3;
}

.col-dot {
  width: 8px;
  height: 8px;
  border-radius: $radius-full;
  background: var(--col-color);
}

.col-title {
  font-weight: $fw-semibold;
  font-size: $fs-md;
}

.col-count {
  margin-left: auto;
  font-size: $fs-sm;
  color: $color-ink-3;
  background: $color-bg;
  padding: 1px 8px;
  border-radius: $radius-full;
}

.col-body {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: $sp-2;
}

// ============ 任务卡 ============
.task-card {
  background: $color-surface;
  border: 1px solid $color-line;
  border-radius: $radius-md;
  padding: $sp-3;
  cursor: grab;
  transition:
    box-shadow $dur-fast $ease,
    transform $dur-fast $ease;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: $shadow-hover;
    transform: translateY(-1px);
  }

  &:active {
    cursor: grabbing;
  }
}

.task-ghost {
  opacity: 0.4;
  background: $color-bg-hover;
}

.task-dragging {
  transform: rotate(2deg);
  box-shadow: $shadow-lg;
}

.task-priority {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;

  &.urgent {
    background: #c0392b;
  }
  &.high {
    background: $color-accent;
  }
  &.medium {
    background: $color-amber;
  }
  &.low {
    background: $color-ink-3;
  }
}

.task-title {
  font-size: $fs-base;
  font-weight: $fw-medium;
  line-height: $lh-snug;
  margin-bottom: $sp-2;
  padding-left: $sp-1;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: $sp-2;
}

.task-tag {
  font-size: $fs-xs;
  padding: 1px $sp-1;
  background: $color-bg-soft;
  border-radius: $radius-xs;
  color: $color-ink-2;
}

.task-progress {
  margin-bottom: $sp-2;
}

.task-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-meta {
  display: flex;
  gap: $sp-2;
  font-size: $fs-xs;
  color: $color-ink-3;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 2px;

  &.overdue {
    color: #c0392b;
    font-weight: $fw-medium;
  }
}

.task-assignee {
  width: 24px;
  height: 24px;
  border-radius: $radius-full;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: $fs-xs;
  font-weight: $fw-bold;
  flex-shrink: 0;
}

// ============ 列表视图 ============
.list-view {
  @include card-base;
  padding: $sp-5;
}

.priority-badge {
  display: inline-block;
  padding: 2px $sp-2;
  border-radius: $radius-sm;
  font-size: $fs-xs;
  font-weight: $fw-medium;

  &.urgent {
    background: #ffe2dd;
    color: #b13b2c;
  }
  &.high {
    background: $color-accent-soft;
    color: $color-accent-ink;
  }
  &.medium {
    background: #fdecc8;
    color: #976d23;
  }
  &.low {
    background: $color-bg-soft;
    color: $color-ink-2;
  }
}

.status-badge {
  display: inline-block;
  padding: 2px $sp-2;
  border-radius: $radius-sm;
  font-size: $fs-xs;

  &.todo {
    background: $color-bg-soft;
    color: $color-ink-2;
  }
  &.progress {
    background: #d3e5ef;
    color: #1f5b78;
  }
  &.review {
    background: #fdecc8;
    color: #976d23;
  }
  &.done {
    background: #dbeddb;
    color: #2b593f;
  }
}

// ============ 详情抽屉 ============
.detail-section {
  margin-bottom: $sp-5;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: $sp-2 0;
  border-bottom: 1px solid $color-line;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  width: 80px;
  flex-shrink: 0;
  color: $color-ink-2;
  font-size: $fs-sm;
}

.detail-desc {
  margin-top: $sp-2;
  font-size: $fs-base;
  line-height: $lh-relaxed;
  color: $color-ink;
}

.detail-actions {
  display: flex;
  gap: $sp-2;
  margin-top: $sp-6;
  padding-top: $sp-4;
  border-top: 1px solid $color-line;
}

// 响应式
@media (max-width: 1100px) {
  .board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .board {
    grid-template-columns: 1fr;
  }
}
</style>
