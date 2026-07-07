import request from './request'
import type { Task, TaskStatus } from '@/types/project'

export const getTasks = () => request.get<Task[]>('/project/tasks')

export const saveTask = (data: Partial<Task>) => request.post<void>('/project/task/save', data)

export const moveTask = (taskId: string, toStatus: TaskStatus, toIndex: number) =>
  request.post<void>('/project/task/move', { taskId, toStatus, toIndex })

export const deleteTask = (id: string) => request.post<void>('/project/task/delete', { id })
