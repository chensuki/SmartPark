<template>
  <div class="not-found">
    <div class="nf-code">404</div>
    <p class="nf-text">页面走丢了</p>
    <p class="nf-sub muted-2">你访问的页面不存在或已被移除</p>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<style scoped lang="scss">
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $sp-2;
  background: $color-bg-soft;
}

.nf-code {
  font-family: $font-serif;
  font-size: 120px;
  font-weight: $fw-bold;
  color: $color-accent;
  line-height: 1;
  letter-spacing: -0.03em;
}

.nf-text {
  font-size: $fs-xl;
  font-weight: $fw-semibold;
}

.nf-sub {
  margin-bottom: $sp-4;
}
</style>
