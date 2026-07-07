import request from './request'
import type { KpiItem, Alarm } from '@/types/global'

/** 首页 KPI 数据 */
export const getDashboardKpis = () => request.get<KpiItem[]>('/dashboard/kpis')

/** 实时活动流 */
export const getDashboardActivities = () =>
  request.get<Array<{ id: string; who: string; action: string; target: string; time: string }>>(
    '/dashboard/activities'
  )

/** 实时告警列表 */
export const getDashboardAlarms = () => request.get<Alarm[]>('/dashboard/alarms')

/** 能耗趋势（折线图） */
export const getEnergyTrend = (days = 7) =>
  request.get<{ labels: string[]; values: number[] }>('/dashboard/energy-trend', {
    params: { days },
  })

/** 园区分布（地图散点） */
export const getParkDistribution = () =>
  request.get<Array<{ name: string; value: number; coord: [number, number] }>>(
    '/dashboard/distribution'
  )
