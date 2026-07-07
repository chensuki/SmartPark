import type { MockMethod } from 'vite-plugin-mock'
import type { Task, TaskStatus } from '../src/types/project'

let tasks: Task[] = [
  // 待办
  {
    id: 't1',
    title: '园区A区能耗数据分析报告',
    status: 'todo',
    priority: 'high',
    assignee: '张明',
    assigneeColor: '#f1c40f',
    dueDate: '2026-07-10',
    tags: ['数据分析', 'A区'],
    commentCount: 2,
    createdAt: '2026-07-01',
    progress: 0,
  },
  {
    id: 't2',
    title: '新设备采购需求评审',
    status: 'todo',
    priority: 'medium',
    assignee: '李娜',
    assigneeColor: '#3498db',
    dueDate: '2026-07-12',
    tags: ['采购'],
    commentCount: 0,
    createdAt: '2026-07-02',
    progress: 0,
  },
  {
    id: 't3',
    title: 'B-03 楼宇巡检计划制定',
    status: 'todo',
    priority: 'low',
    assignee: '王强',
    assigneeColor: '#e67e22',
    dueDate: '2026-07-15',
    tags: ['巡检'],
    createdAt: '2026-07-03',
    progress: 0,
  },
  // 进行中
  {
    id: 't4',
    title: '智能门禁系统升级',
    status: 'progress',
    priority: 'urgent',
    assignee: '赵敏',
    assigneeColor: '#9b59b6',
    dueDate: '2026-07-08',
    tags: ['门禁', '紧急'],
    commentCount: 5,
    attachmentCount: 2,
    createdAt: '2026-06-28',
    progress: 60,
  },
  {
    id: 't5',
    title: 'AI 能耗优化算法部署',
    status: 'progress',
    priority: 'high',
    assignee: '陈晨',
    assigneeColor: '#1abc9c',
    dueDate: '2026-07-09',
    tags: ['AI', '能耗'],
    commentCount: 8,
    createdAt: '2026-06-25',
    progress: 40,
  },
  // 待评审
  {
    id: 't6',
    title: 'C 区监控摄像头布局方案',
    status: 'review',
    priority: 'medium',
    assignee: '张明',
    assigneeColor: '#f1c40f',
    dueDate: '2026-07-06',
    tags: ['监控', 'C区'],
    commentCount: 3,
    createdAt: '2026-06-20',
    progress: 90,
  },
  // 已完成
  {
    id: 't7',
    title: 'Q2 园区运营总结报告',
    status: 'done',
    priority: 'high',
    assignee: '李娜',
    assigneeColor: '#3498db',
    dueDate: '2026-06-30',
    tags: ['报告'],
    commentCount: 12,
    createdAt: '2026-06-10',
    progress: 100,
  },
  {
    id: 't8',
    title: '供应商合同续签',
    status: 'done',
    priority: 'medium',
    assignee: '王强',
    assigneeColor: '#e67e22',
    dueDate: '2026-06-28',
    tags: ['合同'],
    commentCount: 4,
    createdAt: '2026-06-15',
    progress: 100,
  },
]

/** 安全包装：避免单个 mock response 抛异常导致整个 dev server 崩溃 */
function safe(handler: () => any): any {
  try {
    return handler()
  } catch (e) {
    console.error('[mock/project] response error:', e)
    return { code: 500, message: 'Mock 服务内部错误', data: null }
  }
}

export default [
  {
    url: '/api/project/tasks',
    method: 'get',
    response: () => safe(() => ({ code: 0, message: 'ok', data: tasks })),
  },
  {
    url: '/api/project/task/save',
    method: 'post',
    response: ({ body }: { body: Partial<Task> }) =>
      safe(() => {
        if (!body) return { code: 400, message: '缺少请求体', data: null }
        if (body.id) {
          const idx = tasks.findIndex((t) => t.id === body.id)
          if (idx >= 0) tasks[idx] = { ...tasks[idx], ...body }
        } else {
          tasks = [
            {
              ...body,
              id: `t-${Date.now()}`,
              createdAt: new Date().toLocaleDateString('zh-CN'),
            } as Task,
            ...tasks,
          ]
        }
        return { code: 0, message: 'ok', data: null }
      }),
  },
  // 批量更新状态（拖拽后调用）
  {
    url: '/api/project/task/move',
    method: 'post',
    response: ({ body }: { body: { taskId?: string; toStatus?: TaskStatus; toIndex?: number } }) =>
      safe(() => {
        if (!body?.taskId || !body.toStatus) {
          return { code: 400, message: '缺少 taskId 或 toStatus', data: null }
        }
        const task = tasks.find((t) => t.id === body.taskId)
        if (task) {
          task.status = body.toStatus
          // 自动调整进度
          if (body.toStatus === 'done') task.progress = 100
          else if (body.toStatus === 'progress' && task.progress === 0) task.progress = 10
        }
        return { code: 0, message: 'ok', data: null }
      }),
  },
  {
    url: '/api/project/task/delete',
    method: 'post',
    response: ({ body }: { body: { id?: string } }) =>
      safe(() => {
        if (!body?.id) return { code: 400, message: '缺少 id', data: null }
        tasks = tasks.filter((t) => t.id !== body.id)
        return { code: 0, message: 'ok', data: null }
      }),
  },
] as MockMethod[]
