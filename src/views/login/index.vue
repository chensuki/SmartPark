<template>
  <div class="login-page">
    <div class="login-bg"></div>

    <div class="login-card">
      <div class="login-head">
        <div class="brand-mark">SP</div>
        <div>
          <h1 class="title">SmartPark</h1>
          <p class="subtitle">智慧园区运营平台</p>
        </div>
      </div>

      <p class="lede">面向智慧城市、智能制造与协同办公的一站式运营管理。</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        size="large"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号（任意）" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码（任意）"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
          登 录
        </el-button>
      </el-form>

      <p class="hint muted-2">Demo 环境：任意账号密码即可登录，数据由 Mock 生成</p>
    </div>

    <footer class="login-foot muted-2">
      SmartPark © 2026 · Built with Vue 3 + TypeScript + Element Plus
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      await userStore.login(form.username, form.password)
      ElMessage.success('登录成功')
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch (err) {
      console.error('[login] failed:', err)
      ElMessage.error('登录失败，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $sp-6;
  position: relative;
  overflow: hidden;
  background: $color-bg-soft;
}

// 装饰背景：暖色渐变光晕（不用紫渐变）
.login-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(201, 100, 66, 0.08), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(31, 110, 140, 0.06), transparent 40%);
  pointer-events: none;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: $color-surface;
  border: 1px solid $color-line;
  border-radius: $radius-xl;
  padding: $sp-10 $sp-8;
  box-shadow: $shadow-lg;
}

.login-head {
  display: flex;
  align-items: center;
  gap: $sp-3;
  margin-bottom: $sp-2;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: $radius-md;
  background: linear-gradient(135deg, $color-accent, $color-accent-ink);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: $fw-bold;
  font-size: $fs-md;
}

.title {
  font-size: $fs-xl;
  font-weight: $fw-bold;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: $fs-sm;
  color: $color-ink-2;
}

.lede {
  font-size: $fs-base;
  color: $color-ink-2;
  margin-bottom: $sp-6;
  line-height: $lh-relaxed;
}

:deep(.el-form-item__label) {
  font-size: $fs-sm !important;
  font-weight: $fw-medium !important;
  color: $color-ink-2 !important;
}

.login-btn {
  width: 100%;
  margin-top: $sp-2;
  height: 44px;
  font-size: $fs-md;
  font-weight: $fw-medium;
  background: $color-accent;
  border-color: $color-accent;

  &:hover {
    background: $color-accent-ink;
    border-color: $color-accent-ink;
  }
}

.hint {
  text-align: center;
  font-size: $fs-sm;
  margin-top: $sp-4;
}

.login-foot {
  position: relative;
  margin-top: $sp-6;
  font-size: $fs-sm;
  font-family: $font-mono;
}
</style>
