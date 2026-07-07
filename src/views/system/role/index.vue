<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="title">角色管理</h1>
        <p class="sub muted">配置角色及其可访问的菜单和操作权限</p>
      </div>
      <el-button v-permission="'role:add'" type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon><span style="margin-left: 6px">新增角色</span>
      </el-button>
    </header>

    <div class="card">
      <div class="role-grid">
        <div
          v-for="role in roles"
          :key="role.id"
          class="role-card"
          :class="{ 'is-active': activeRole?.id === role.id }"
          @click="selectRole(role)"
        >
          <div class="role-head">
            <div class="role-icon" :class="role.code">{{ role.name.charAt(0) }}</div>
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-code mono">{{ role.code }}</div>
            </div>
            <el-tag v-if="role.status === 'disabled'" type="info" size="small">已禁用</el-tag>
          </div>
          <p class="role-desc muted">{{ role.description || '—' }}</p>
          <div class="role-meta">
            <span class="muted">{{ role.userCount || 0 }} 用户</span>
            <span class="muted">{{ getPermissionCount(role) }} 项权限</span>
          </div>
          <div class="role-actions">
            <el-button
              v-permission="'role:edit'"
              link
              type="primary"
              size="small"
              @click.stop="openDialog(role)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'role:auth'"
              link
              type="primary"
              size="small"
              @click.stop="openAuthDialog(role)"
            >
              分配权限
            </el-button>
            <el-button
              v-permission="'role:add'"
              link
              type="danger"
              size="small"
              :disabled="role.code === 'admin'"
              @click.stop="handleDelete(role)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editing.id ? '编辑角色' : '新增角色'" width="460px">
      <el-form ref="formRef" :model="editing" :rules="rules" label-width="80px">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="editing.name" placeholder="如：园区经理" />
        </el-form-item>
        <el-form-item label="标识码" prop="code">
          <el-input
            v-model="editing.code"
            :disabled="!!editing.id"
            placeholder="如：park_manager"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editing.description"
            type="textarea"
            :rows="2"
            placeholder="角色职责说明"
          />
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

    <!-- 权限分配弹窗 -->
    <el-dialog
      v-model="authDialogVisible"
      :title="`分配权限 - ${activeRole?.name || ''}`"
      width="640px"
    >
      <div class="auth-tip muted">勾选该角色可以访问的菜单和操作。超级管理员默认拥有全部权限。</div>
      <ElTree
        ref="treeRef"
        :data="menuTreeData"
        :props="treeProps"
        node-key="id"
        show-checkbox
        :default-checked-keys="checkedMenuIds"
        :default-expand-all="true"
        check-strictly
      >
        <template #default="{ data }">
          <MenuIcon v-if="data.icon" :name="data.icon" :size="14" class="tree-icon" />
          <span class="tree-label">{{ data.name }}</span>
          <el-tag
            v-if="data.type"
            :type="
              data.type === 'button' ? 'warning' : data.type === 'directory' ? 'info' : 'success'
            "
            size="small"
            class="tree-type"
          >
            {{ typeText[data.type] }}
          </el-tag>
          <span v-if="data.permission" class="tree-perm mono">{{ data.permission }}</span>
        </template>
      </ElTree>
      <template #footer>
        <el-button @click="authDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveAuth">保存权限</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, ElTree, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getRoleList, saveRole, deleteRole, getMenuTree } from '@/api/system'
import type { Role, MenuItem } from '@/types/rbac'
import { MENU_TREE } from '@/mock/rbac-data'

const roles = ref<Role[]>([])
const activeRole = ref<Role | null>(null)
const menuTreeData = ref<MenuItem[]>([])
const checkedMenuIds = ref<string[]>([])
const treeRef = ref<InstanceType<typeof ElTree>>()
const saving = ref(false)

const treeProps = { children: 'children', label: 'name' }
const typeText: Record<string, string> = { directory: '目录', menu: '菜单', button: '按钮' }

function getPermissionCount(role: Role) {
  if (role.code === 'admin') return '全部'
  // 防御：menuIds 可能为 undefined（新增未分配权限的角色）
  return role.menuIds?.length ?? 0
}

function selectRole(role: Role) {
  activeRole.value = role
}

// ============ 角色编辑 ============
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editing = reactive<Partial<Role>>({ name: '', code: '', description: '', status: 'enabled' })

const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名', trigger: 'blur' }],
  code: [{ required: true, message: '请输入标识码', trigger: 'blur' }],
}

function openDialog(role?: Role) {
  Object.assign(
    editing,
    role ? { ...role } : { name: '', code: '', description: '', status: 'enabled' }
  )
  if (role) editing.id = role.id
  else delete editing.id
  dialogVisible.value = true
}

async function handleSave() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await saveRole({ ...editing })
      ElMessage.success(editing.id ? '更新成功' : '创建成功')
      dialogVisible.value = false
      await loadRoles()
    } finally {
      saving.value = false
    }
  })
}

function handleDelete(role: Role) {
  ElMessageBox.confirm(
    `确认删除角色「${role.name}」？已分配该角色的用户将失去对应权限`,
    '删除确认',
    {
      type: 'warning',
    }
  )
    .then(async () => {
      await deleteRole(role.id)
      ElMessage.success('删除成功')
      loadRoles()
    })
    .catch(() => {})
}

// ============ 权限分配 ============
const authDialogVisible = ref(false)

async function openAuthDialog(role: Role) {
  activeRole.value = role
  // 管理员不可分配（拥有全部权限）
  if (role.code === 'admin') {
    ElMessage.info('超级管理员默认拥有全部权限')
    return
  }
  menuTreeData.value = menuTreeData.value.length ? menuTreeData.value : await getMenuTree()
  checkedMenuIds.value = [...(role.menuIds ?? [])]
  authDialogVisible.value = true
}

async function handleSaveAuth() {
  if (!activeRole.value || !treeRef.value) return
  const checked = treeRef.value.getCheckedKeys() as string[]
  const halfChecked = treeRef.value.getHalfCheckedKeys() as string[]
  const allIds = [...checked, ...halfChecked]
  saving.value = true
  try {
    await saveRole({ id: activeRole.value.id, menuIds: allIds })
    ElMessage.success('权限已更新')
    authDialogVisible.value = false
    // 同步更新本地角色数据
    activeRole.value.menuIds = allIds
    await loadRoles()
  } finally {
    saving.value = false
  }
}

async function loadRoles() {
  roles.value = await getRoleList()
}

onMounted(async () => {
  menuTreeData.value = MENU_TREE // 直接用导入的常量（Mock 简化）
  await loadRoles()
  if (roles.value.length) selectRole(roles.value[0])
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
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $sp-4;
}

.role-card {
  border: 1px solid $color-line;
  border-radius: $radius-lg;
  padding: $sp-4;
  cursor: pointer;
  transition: all $dur-base $ease;

  &:hover {
    border-color: $color-accent;
    box-shadow: $shadow-hover;
  }

  &.is-active {
    border-color: $color-accent;
    background: $color-accent-soft;
  }
}

.role-head {
  display: flex;
  align-items: center;
  gap: $sp-3;
  margin-bottom: $sp-2;
}

.role-icon {
  width: 40px;
  height: 40px;
  border-radius: $radius-md;
  background: linear-gradient(135deg, $color-ink, $color-ink-2);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: $fw-bold;
  font-size: $fs-lg;

  &.admin {
    background: linear-gradient(135deg, #c0392b, #8e2b1f);
  }
  &.park_manager {
    background: linear-gradient(135deg, $color-accent, $color-accent-ink);
  }
  &.operator {
    background: linear-gradient(135deg, #1f6e8c, #15506b);
  }
  &.viewer {
    background: linear-gradient(135deg, #787774, #5a534f);
  }
}

.role-info {
  flex: 1;
  min-width: 0;
}

.role-name {
  font-weight: $fw-semibold;
  font-size: $fs-md;
}

.role-code {
  font-size: $fs-xs;
  color: $color-ink-3;
}

.role-desc {
  font-size: $fs-sm;
  line-height: $lh-relaxed;
  min-height: 40px;
  margin-bottom: $sp-2;
}

.role-meta {
  display: flex;
  gap: $sp-4;
  font-size: $fs-sm;
  padding-top: $sp-2;
  border-top: 1px solid $color-line;
  margin-bottom: $sp-2;
}

.role-actions {
  display: flex;
  gap: $sp-1;
}

// 权限树
.auth-tip {
  font-size: $fs-sm;
  margin-bottom: $sp-3;
  padding: $sp-2 $sp-3;
  background: $color-bg-soft;
  border-radius: $radius-sm;
}

// 用最朴素的 inline 元素 + margin，避免 flex 干扰 el-tree 的缩进
// el-tree 缩进通过 .el-tree-node__content 的 padding-left 实现
.tree-icon {
  color: $color-ink-2;
  margin-right: $sp-2;
  vertical-align: middle;
}

.tree-label {
  font-weight: $fw-medium;
  vertical-align: middle;
  white-space: nowrap;
}

.tree-type {
  margin-left: $sp-2;
  vertical-align: middle;
}

.tree-perm {
  font-size: $fs-xs;
  color: $color-ink-3;
  padding: 1px $sp-1;
  background: $color-bg-soft;
  border-radius: $radius-xs;
  margin-left: $sp-2;
  vertical-align: middle;
}
</style>
