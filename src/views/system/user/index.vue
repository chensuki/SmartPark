<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="title">用户管理</h1>
        <p class="sub muted">管理平台用户账号、角色分配与启用状态</p>
      </div>
      <el-button v-permission="'user:add'" type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon><span style="margin-left: 6px">新增用户</span>
      </el-button>
    </header>

    <!-- 搜索 -->
    <div class="card search-card">
      <el-form :model="filters" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="姓名 / 用户名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filters.roleId" placeholder="全部角色" clearable style="width: 160px">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon><span style="margin-left: 6px">查询</span>
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="card">
      <div class="table-toolbar">
        <span class="muted">共 {{ table.total.value }} 条</span>
        <el-button
          v-if="selectedIds.length"
          v-permission="'user:delete'"
          type="danger"
          plain
          size="small"
          @click="handleBatchDelete"
        >
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>
      <el-table
        v-loading="table.loading.value"
        :data="table.data.value"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column label="姓名" width="120">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="avatar">{{ row.name.charAt(0) }}</div>
              {{ row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="角色" width="140">
          <template #default="{ row }">
            <el-tag
              :type="row.roleId === 'r-admin' ? 'danger' : 'info'"
              size="small"
              effect="light"
            >
              {{ row.roleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'enabled'"
              @change="(v) => toggleStatus(row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'user:edit'"
              link
              type="primary"
              size="small"
              @click="openDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'user:reset'"
              link
              type="warning"
              size="small"
              @click="resetPwd(row)"
            >
              重置密码
            </el-button>
            <el-button
              v-permission="'user:delete'"
              link
              type="danger"
              size="small"
              :disabled="row.roleId === 'r-admin'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editing.id ? '编辑用户' : '新增用户'"
      width="480px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="editing" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editing.username" :disabled="!!editing.id" placeholder="登录账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editing.name" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="editing.roleId" placeholder="选择角色" style="width: 100%">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editing.phone" placeholder="选填" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editing.email" placeholder="选填" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="editing.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useTable } from '@/composables/useTable'
import { getUserList, saveUser, deleteUsers, getRoleList } from '@/api/system'
import type { SystemUser, Role, UserQuery } from '@/types/rbac'

const roles = ref<Role[]>([])

const filters = reactive<{ keyword: string; roleId: string; status: string }>({
  keyword: '',
  roleId: '',
  status: '',
})

const table = useTable<SystemUser, UserQuery>(getUserList, { page: 1, pageSize: 10 })

// 手动控制查询参数（因为 useTable 默认用 PageQuery）
function syncFilters() {
  table.query.keyword = filters.keyword || undefined
  table.query.roleId = filters.roleId || undefined
  table.query.status = filters.status || undefined
}

function handleSearch() {
  syncFilters()
  table.handleSearch()
}

function handleReset() {
  filters.keyword = ''
  filters.roleId = ''
  filters.status = ''
  syncFilters()
  table.handleReset()
}

// 多选
const selectedIds = ref<string[]>([])
function handleSelectionChange(rows: SystemUser[]) {
  selectedIds.value = rows.map((r) => r.id)
}

// ============ 新增/编辑 ============
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const editing = reactive<Partial<SystemUser>>({
  username: '',
  name: '',
  roleId: '',
  phone: '',
  email: '',
  status: 'enabled',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

function openDialog(row?: any) {
  Object.assign(
    editing,
    row
      ? { ...row }
      : { username: '', name: '', roleId: '', phone: '', email: '', status: 'enabled' }
  )
  if (row) editing.id = row.id
  else delete editing.id
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveUser({ ...editing })
      ElMessage.success(editing.id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      table.refresh()
    } finally {
      saving.value = false
    }
  })
}

// ============ 其他操作 ============
async function toggleStatus(row: any, enabled: boolean | string | number) {
  const newStatus = enabled ? 'enabled' : 'disabled'
  await saveUser({ id: row.id, status: newStatus })
  row.status = newStatus
  ElMessage.success(`已${enabled ? '启用' : '禁用'} ${row.name}`)
}

function resetPwd(row: any) {
  ElMessageBox.confirm(`确认重置 ${row.name} 的密码为默认密码（123456）？`, '重置密码', {
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('密码已重置')
    })
    .catch(() => {})
}

function handleDelete(row: any) {
  ElMessageBox.confirm(`确认删除用户 ${row.name}？此操作不可恢复`, '删除确认', {
    type: 'warning',
  })
    .then(async () => {
      await deleteUsers([row.id])
      ElMessage.success('删除成功')
      table.refresh()
    })
    .catch(() => {})
}

function handleBatchDelete() {
  ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个用户？`, '批量删除', {
    type: 'warning',
  })
    .then(async () => {
      await deleteUsers(selectedIds.value)
      ElMessage.success('删除成功')
      selectedIds.value = []
      table.refresh()
    })
    .catch(() => {})
}

onMounted(async () => {
  roles.value = await getRoleList()
  table.refresh()
})
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

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $sp-3;
  font-size: $fs-sm;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: $sp-2;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: $radius-full;
  background: linear-gradient(135deg, $color-accent, $color-accent-ink);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: $fs-sm;
  font-weight: $fw-semibold;
  flex-shrink: 0;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: $sp-4;
}
</style>
