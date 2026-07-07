module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 代码格式（不影响功能）
        'refactor', // 重构（既不是 feat 也不是 fix）
        'perf', // 性能优化
        'test', // 增加测试
        'build', // 构建系统或外部依赖变更
        'ci', // CI 配置
        'chore', // 杂项（不修改 src 或 test）
        'revert', // 回滚
      ],
    ],
    'subject-case': [0], // 允许中文 commit
    'subject-max-length': [2, 'always', 72],
  },
}
