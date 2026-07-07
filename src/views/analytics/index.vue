<template>
  <div class="page">
    <header class="page-head">
      <h1 class="title text-serif">数据分析</h1>
      <p class="sub muted">园区运营核心指标深度洞察 · NYT-style</p>
    </header>

    <!-- 编辑型叙事（来自 frame-data-chart-nyt） -->
    <article class="narrative">
      <div class="kicker accent">SMARTPARK · ANNUAL REPORT · 2025-2026</div>
      <h2 class="headline text-serif">
        园区能耗在 <span class="hl">2024 之后</span> 进入下降通道 —— AI 优化策略让单位面积能耗下降
        23%。
      </h2>

      <!-- 手绘 SVG 折线（NYT 风） -->
      <svg viewBox="0 0 1100 320" class="chart-svg">
        <!-- 网格 -->
        <g stroke="#1a1a1a" stroke-width="0.5" opacity="0.15">
          <line x1="60" y1="60" x2="1040" y2="60" />
          <line x1="60" y1="160" x2="1040" y2="160" />
          <line x1="60" y1="260" x2="1040" y2="260" />
        </g>
        <!-- Y 轴标签 -->
        <g class="axis-label" font-size="11" fill="#787774">
          <text x="20" y="64">600</text>
          <text x="20" y="164">400</text>
          <text x="20" y="264">200</text>
        </g>
        <!-- 区域填充 -->
        <path
          d="M 60 250 L 180 240 L 300 245 L 420 220 L 540 210 L 660 180 L 780 150 L 900 110 L 1020 80 L 1020 290 L 60 290 Z"
          fill="#c96442"
          opacity="0.06"
        />
        <!-- 主线 -->
        <polyline
          class="draw-line"
          fill="none"
          stroke="#c96442"
          stroke-width="2.5"
          stroke-linejoin="round"
          stroke-linecap="round"
          points="60,250 180,240 300,245 420,220 540,210 660,180 780,150 900,110 1020,80"
        />
        <!-- 拐点高亮 -->
        <polyline
          fill="none"
          stroke="#a91d1d"
          stroke-width="2.5"
          stroke-dasharray="6 5"
          points="660,180 780,150 900,110 1020,80"
        />
        <!-- 数据点 -->
        <circle cx="60" cy="250" r="3.5" fill="#1a1a1a" />
        <circle cx="180" cy="240" r="3.5" fill="#1a1a1a" />
        <circle cx="300" cy="245" r="3.5" fill="#1a1a1a" />
        <circle cx="420" cy="220" r="3.5" fill="#1a1a1a" />
        <circle cx="540" cy="210" r="3.5" fill="#1a1a1a" />
        <circle cx="660" cy="180" r="5" fill="#a91d1d" />
        <circle cx="780" cy="150" r="5" fill="#a91d1d" />
        <circle cx="900" cy="110" r="5" fill="#a91d1d" />
        <circle cx="1020" cy="80" r="5" fill="#a91d1d" />
        <!-- 拐点注释 -->
        <g class="annotation">
          <text x="680" y="170" font-size="13" font-style="italic" fill="#a91d1d">
            ⤴ AI 优化启动
          </text>
          <text x="980" y="65" font-size="12" text-anchor="end" fill="#a91d1d" class="axis-label">
            2026 · 210 kWh/㎡
          </text>
        </g>
        <!-- X 轴 -->
        <g class="axis-label" font-size="11" fill="#787774">
          <text x="60" y="290" text-anchor="middle">'18</text>
          <text x="180" y="290" text-anchor="middle">'19</text>
          <text x="300" y="290" text-anchor="middle">'20</text>
          <text x="420" y="290" text-anchor="middle">'21</text>
          <text x="540" y="290" text-anchor="middle">'22</text>
          <text x="660" y="290" text-anchor="middle">'23</text>
          <text x="780" y="290" text-anchor="middle">'24</text>
          <text x="900" y="290" text-anchor="middle">'25</text>
          <text x="1020" y="290" text-anchor="middle">'26</text>
        </g>
      </svg>

      <p class="source muted-2 mono">Source · SmartPark 内部 BI · 2026-05</p>
    </article>

    <!-- 三栏洞察 -->
    <section class="insights">
      <div class="insight-card">
        <div class="emoji">📉</div>
        <h3>单位能耗 -23%</h3>
        <p class="muted">AI 调度让楼宇空调、照明智能协同，年节省电费 240 万。</p>
      </div>
      <div class="insight-card">
        <div class="emoji">🏢</div>
        <h3>入驻率 +18%</h3>
        <p class="muted">数字化招商流程 + 数据看板，新企业入驻周期从 14 天降到 5 天。</p>
      </div>
      <div class="insight-card">
        <div class="emoji">🔧</div>
        <h3>故障响应 -65%</h3>
        <p class="muted">设备预测性维护，平均故障响应时间从 4.2h 降到 1.5h。</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.page {
  max-width: 1100px;
  margin: 0 auto;
  background: #fafaf7;
  padding: $sp-12 $sp-8;
  border-radius: $radius-lg;
}

.page-head {
  margin-bottom: $sp-8;
}

.title {
  font-size: $fs-3xl;
  font-weight: $fw-bold;
  letter-spacing: -0.01em;
}

.sub {
  font-size: $fs-md;
  margin-top: $sp-1;
}

// 叙事
.narrative {
  margin-bottom: $sp-10;
}

.kicker {
  font-size: $fs-xs;
  font-weight: $fw-semibold;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: $sp-2;
}

.headline {
  font-size: clamp(28px, 3.5vw, 48px);
  line-height: 1.15;
  font-weight: $fw-medium;
  color: #15140f;
  margin-bottom: $sp-6;

  .hl {
    color: $color-accent;
    font-style: italic;
  }
}

.chart-svg {
  width: 100%;
  height: auto;
}

.draw-line {
  stroke-dasharray: 1500;
  stroke-dashoffset: 1500;
  animation: draw 1.6s $ease-out 0.3s forwards;
}

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

.axis-label {
  font-family: $font-mono;
}

.annotation {
  font-family: $font-serif;
}

.source {
  font-size: $fs-xs;
  margin-top: $sp-2;
}

// 洞察卡
.insights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $sp-4;
}

.insight-card {
  background: #fff;
  border: 1px solid #ececea;
  border-radius: $radius-lg;
  padding: $sp-5;

  .emoji {
    font-size: $fs-4xl;
    margin-bottom: $sp-2;
  }

  h3 {
    font-size: $fs-lg;
    font-weight: $fw-semibold;
    margin-bottom: $sp-2;
  }

  p {
    font-size: $fs-base;
    line-height: $lh-relaxed;
  }
}

@media (max-width: 800px) {
  .insights {
    grid-template-columns: 1fr;
  }
}
</style>
