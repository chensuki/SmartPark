# SmartPark · 智慧园区运营平台

> 一个 Vue 3 + TypeScript 的中后台 Demo，覆盖智慧城市/智能制造/协同办公场景。
> 双形态设计：**Notion 暖白精致后台** + **赛博暗黑监控大屏**。

## ✨ 技术栈

| 类别 | 选型 | JD 对应 |
|------|------|---------|
| 框架 | Vue 3.5 `<script setup>` + Composition API | 硬性 3 |
| 语言 | TypeScript 5（全量） | 优先 2 |
| 构建 | Vite 5（分包/懒加载/自动导入） | 优先 2 |
| 路由 | Vue Router 4（动态路由 + 守卫） | 硬性 3 |
| 状态 | Pinia + pinia-plugin-persistedstate | 硬性 3 |
| HTTP | Axios（拦截器/Token/错误兜底/解包） | 优先 3 |
| UI | Element Plus（按需引入） | 优先 4 |
| 图表 | ECharts 5（按需 + 双主题定制 + 中国地图） | 智慧城市必需 |
| Mock | vite-plugin-mock | 接口联调 |
| 工具 | VueUse + dayjs + lodash-es | 现代实践 |
| 拖拽 | vuedraggable 4 | 协同办公看板 |
| 虚拟列表 | vue-virtual-scroller | 大屏万条数据 |
| 规范 | ESLint + Prettier + Husky + Commitlint | 文档/规范 4 |

## 🚀 快速开始

```bash
# 安装依赖（推荐 pnpm）
pnpm install

# 开发
pnpm dev          # → http://localhost:5173

# 类型检查
pnpm type-check

# 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

**登录**：任意账号密码即可（Mock 数据）。

## 📐 项目结构

```
src/
├── api/              # 接口层
│   ├── request.ts    #   Axios 封装（拦截器/统一错误/解包）
│   ├── auth.ts
│   └── dashboard.ts
├── assets/           # 静态资源（SVG 图标）
├── components/       # 全局组件（自动注册）
├── composables/      # 组合式函数 ⭐
│   ├── useECharts.ts #   ECharts 实例管理（按需注册）
│   ├── useTween.ts   #   数字动画（rAF + reduced-motion）
│   └── useTable.ts   #   表格通用逻辑（分页/查询/loading）
├── directives/       # 自定义指令
│   └── permission.ts #   v-permission 按钮级权限
├── layouts/
│   └── DefaultLayout.vue  # 暖白后台布局（侧栏+顶栏+实时药丸）
├── router/
│   └── index.ts      # 路由（动态路由 + 进度条 + 鉴权守卫）
├── stores/
│   ├── app.ts        #   主题/侧栏/设备（持久化）
│   └── user.ts       #   用户/Token/权限
├── styles/
│   ├── variables.scss #  设计 token（暖白 + 赛博双主题）
│   ├── mixins.scss   #  复用样式
│   ├── reset.scss    #  现代化 reset
│   └── index.scss    #  CSS 变量 + 工具类
├── types/            # TypeScript 类型
├── views/            # 页面
│   ├── login/        #   登录
│   ├── dashboard/    #   工作台（KPI + sparkline + 活动流 + 告警）
│   ├── screen/       #   ⭐ 监控大屏（赛博暗黑）
│   ├── analytics/    #   ⭐ 数据分析（NYT 风 SVG 图表）
│   ├── building/     #   楼宇资产（CRUD + useTable）
│   ├── device/       #   设备监控
│   └── error/404.vue
├── App.vue
└── main.ts

mock/                 # Mock 数据（auth/dashboard）
```

## 🎨 设计语言（反 AI-slop）

拒绝 Inter+紫渐变+白底的通用 AI 美学，本项目定调：

| 维度 | 选择 | 灵感来源 |
|------|------|---------|
| **暖白后台** | `#fafaf9` 底 + Notion 墨色文字 + 朱砂红 `#c96442` accent | html-anything / live-dashboard |
| **赛博大屏** | `#0a0c10` 底 + CRT 网格 + 薄荷绿 `#7ed3a4` + JetBrains Mono | html-anything / deck-hermes-cyber |
| **数据叙事** | 衬线大标题 + 红色点缀 + 纯 SVG 手绘折线 | html-anything / frame-data-chart-nyt |
| **字体** | 中文 Noto Sans SC + 西文 Inter + display Source Serif Pro | 反通稿 |
| **数字** | JetBrains Mono + `font-feature-settings: 'tnum'` | 表格对齐 |

主题切换通过 CSS Variables + `data-theme="dark"` 实现，零运行时开销。

## 🎯 核心亮点（面试讲点）

### 1. Axios 企业级封装（`src/api/request.ts`）
- 请求拦截器：自动注入 Token、NProgress 进度条、并发 loading 合并
- 响应拦截器：业务码解包、统一错误提示、401 失效弹窗（防抖）
- 类型安全：`request.get<T>` 自动推断返回类型
- 可配置：`silent`（静默）、`noLoading`（无进度条）、`token`（覆盖）

### 2. ECharts 组件化（`src/composables/useECharts.ts`）
- **按需注册**：只引入用到的图表/组件，打包体积从 1MB+ 降到 600KB
- **双主题**：暖白配朱砂红、暗黑配薄荷绿，通过 color 数组注入
- **生命周期托管**：`onMounted` 初始化、`onBeforeUnmount` 销毁、resize 监听
- **shallowRef**：避免 ECharts 实例被深度响应式化（性能）

### 3. 数字 tween 动画（`src/composables/useTween.ts`）
- `requestAnimationFrame` 实现 60fps 平滑过渡
- ease-out cubic 缓动
- **尊重 `prefers-reduced-motion`**：无障碍场景直接跳到终值

### 4. 通用表格逻辑（`src/composables/useTable.ts`）
- 分页/查询/重置/loading 一站式封装
- 泛型 `<T>` 支持任意业务实体
- 解耦 UI（Element Plus）与数据逻辑

### 5. 按钮级权限（`src/directives/permission.ts`）
- `v-permission="'user:add'"` 单权限
- `v-permission="['user:edit', 'user:add']"` 满足任一即可
- 无权限直接移除 DOM（比 `v-if` 更彻底）

### 6. 动态路由 + 鉴权守卫（`src/router/index.ts`）
- 路由 meta 声明 `requiresAuth` / `roles`
- 全局前置守卫：白名单、Token 校验、登录后回跳
- `keep-alive` 缓存列表（性能优化）

### 7. 工程化规范
- ESLint：Vue3 + TS recommended
- Prettier：统一格式
- Commitlint：Conventional Commits + 中文 subject
- lint-staged：提交前自动修复
- 自动导入：`unplugin-auto-import` + `unplugin-vue-components`

### 8. 性能优化
- **路由懒加载**：`() => import()` 按需加载页面
- **分包策略**：vue / element / echarts / utils 独立 chunk
- **Element Plus 按需**：Resolver 自动按需引入样式
- **ECharts 按需**：tree-shaking 仅打包用到的图表类型
- **keep-alive**：列表页缓存，二次进入秒开

## 📦 打包产物（build 后体积）

```
vue          112 KB → gzip  44 KB
echarts      619 KB → gzip 207 KB
element     1052 KB → gzip 329 KB
utils         76 KB → gzip  28 KB
业务代码      ~50 KB → gzip ~20 KB（每页独立分包）
─────────────────────────────────
首屏（登录页）约 200 KB gzip，符合性能预算
```

## 🔮 路线图（精品版后续可扩展）

- [x] ✅ 用户/角色/菜单管理（RBAC 完整闭环）
- [x] ✅ 项目协作看板（拖拽 + vuedraggable）
- [x] ✅ 供应链库存（出入库 + 预警 + 供应商）
- [x] ✅ 大屏接入真实 ECharts geo 地图（中国/园区）
- [x] ✅ 虚拟列表（vue-virtual-scroller，万条告警）
- [ ] 单元测试（Vitest + @vue/test-utils）
- [ ] CI/CD（GitHub Actions）

## 🎁 进阶模块（已实现）

### 模块 1：RBAC 权限系统
**对应 JD：「权限控制」「后台管理系统」硬实力**

- **数据流闭环**：登录 → 后端返回角色 → 拉取菜单（按角色过滤）→ **动态注册路由** → 渲染侧栏 + 按钮级权限
- **三个管理页**：
  - 用户管理：CRUD + 多选批量删除 + 启停状态切换 + 重置密码 + 角色分配
  - 角色管理：卡片式列表 + 权限树分配（el-tree + check-strictly + 半选父节点合并）
  - 菜单管理：树形表格 + 三类节点（目录/菜单/按钮）+ 权限标识可视化
- **核心代码**：
  - `src/router/index.ts`：`generateRoutes()` 把后端菜单树转成 RouteRecordRaw
  - `src/directives/permission.ts`：`v-permission` 按钮级指令（无权限移除 DOM）
  - `src/mock/rbac-data.ts`：`filterMenusByRole()` 按角色过滤可见菜单

**面试讲点**：「我实现了基于角色的动态路由 + 按钮级权限指令，刷新页面会自动重新加载权限数据，路由守卫统一鉴权」

### 模块 2：项目协作看板（拖拽）
**对应 JD：「协同办公」场景 + 交互能力**

- **双视图**：看板（4 列拖拽）/ 列表（表格）
- **核心能力**：
  - vuedraggable 跨列拖拽，自动同步状态到后端（失败回滚）
  - 任务卡片：优先级色条 + 标签 + 进度条 + 负责人头像 + 评论/附件计数 + 截止日期（过期红色）
  - 详情抽屉：状态切换 + 进度滑块 + 描述 + 标签
  - 新建/编辑弹窗 + 删除确认
- **拖拽失败回滚**：`onDragEnd` 捕获错误后 `await loadTasks()` 恢复

**面试讲点**：「看板支持跨列拖拽，拖动时乐观更新 UI、后台异步同步，失败自动回滚」

### 模块 3：ECharts 中国地图 + 虚拟列表
**对应 JD：「智慧城市」「数据可视化」「性能优化」**

- **全国园区监控**（`/map`）：
  - 异步加载 DataV 中国 geoJSON（带失败兜底）
  - 散点 + 飞线效果（EffectScatter 涟漪）
  - 区域 TOP5 条形图 + 设备类型环形图
  - tooltip + roam 缩放
- **赛博大屏告警流**（`/screen`）：
  - `RecycleScroller` 虚拟列表渲染 **500+ 条日志**
  - 对比普通 v-for 的性能优势（DOM 节点数固定为可视区域）
- **useECharts 升级**：
  - 按需注册 `EffectScatterChart` + `VisualMapComponent`
  - 新增 `registerChinaMap()` 带 Set 缓存避免重复注册

**面试讲点**：「地图用 DataV 的 geoJSON + ECharts geo 组件，告警流用虚拟列表渲染 500 条只渲染可见的几十个 DOM」

### 模块 4：供应链库存
**对应 JD：「供应链」业务领域**

- **三 Tab 架构**：库存清单 / 出入库记录 / 供应商档案
- **核心能力**：
  - 库存预警：4 档状态（充足/偏低/紧张/缺货），自动根据数量 vs 安全线计算
  - 出入库弹窗：数量上限校验（出库不能超过现有库存）
  - 实时统计：物资种类 / 预警数 / 缺货数 / 库存总值
  - 供应商档案：A/B/C 等级 + 合作状态
- **状态联动**：出入库后自动刷新统计卡 + 列表

**面试讲点**：「供应链覆盖出入库完整流程，库存状态自动计算，操作后多模块联动刷新」

## 📝 JD 对应矩阵

| JD 要求 | 本项目实现 |
|---------|-----------|
| HTML5/CSS3/JS 基础 | 现代化 reset + Flex/Grid + CSS Variables |
| Vue2/Vue3 + 生命周期/组件通信 | Vue 3 Composition API + defineProps/emits |
| Vue Router / Pinia / Vuex | Router 4 动态路由 + Pinia 持久化 |
| Git / npm / ES6+ | pnpm + Conventional Commits + ES2022 |
| TypeScript / Vite / Webpack | 全量 TS + Vite 5 |
| 移动端适配 / 响应式 | `@include respond-to` mixin + rem |
| Axios / 接口联调 | 企业级封装 + Mock 数据 |
| Element Plus / Ant Design Vue | Element Plus 按需 |
| 性能优化 | 懒加载/分包/keep-alive/按需注册 |
| 代码规范/文档 | ESLint+Prettier+Husky+本 README |

---

Built with Vue 3 · TypeScript · Element Plus · ECharts · Vite
