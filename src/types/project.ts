/** 任务状态（对应看板列） */
export type TaskStatus = 'todo' | 'progress' | 'review' | 'done'

/** 任务优先级 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

/** 任务 */
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  /** 负责人 */
  assignee?: string
  assigneeColor?: string
  /** 截止日期 */
  dueDate?: string
  /** 标签 */
  tags?: string[]
  /** 评论数 */
  commentCount?: number
  /** 附件数 */
  attachmentCount?: number
  /** 创建时间 */
  createdAt: string
  /** 完成进度 0-100 */
  progress?: number
}

/** 看板列 */
export interface BoardColumn {
  status: TaskStatus
  title: string
  color: string
  tasks: Task[]
}
