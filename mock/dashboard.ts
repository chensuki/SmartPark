import type { MockMethod } from 'vite-plugin-mock'

export default [
  // KPI
  {
    url: '/api/dashboard/kpis',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'ok',
      data: [
        {
          label: '入驻企业',
          value: 238,
          delta: 12,
          trend: 'up',
          unit: '家',
          series: [220, 224, 230, 232, 235, 236, 238],
        },
        {
          label: '设备总数',
          value: 1820,
          delta: 24,
          trend: 'up',
          unit: '台',
          series: [1700, 1740, 1760, 1780, 1800, 1812, 1820],
        },
        {
          label: '在线率',
          value: 99,
          delta: 2,
          trend: 'up',
          unit: '%',
          series: [95, 96, 94, 97, 98, 99, 99],
        },
        {
          label: '告警数',
          value: 4,
          delta: -3,
          trend: 'down',
          unit: '条',
          series: [12, 9, 11, 8, 7, 5, 4],
        },
      ],
    }),
  },
  // 活动流
  {
    url: '/api/dashboard/activities',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'ok',
      data: [
        { id: 'a1', who: '张明', action: '完成了', target: '楼宇 B-03 的巡检', time: '3 分钟前' },
        {
          id: 'a2',
          who: '李娜',
          action: '处理了',
          target: '设备 DEV-1002 的告警',
          time: '12 分钟前',
        },
        { id: 'a3', who: '系统', action: '检测到', target: '新企业入驻申请', time: '26 分钟前' },
        { id: 'a4', who: '王强', action: '更新了', target: '能耗优化策略', time: '1 小时前' },
        { id: 'a5', who: '赵敏', action: '指派了', target: '维护任务 #M-2031', time: '2 小时前' },
      ],
    }),
  },
  // 告警
  {
    url: '/api/dashboard/alarms',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'ok',
      data: [
        {
          id: 'al1',
          level: 'danger',
          source: '楼宇 B-07',
          message: '烟雾报警器触发，疑似异常',
          time: '14:31:02',
          resolved: false,
        },
        {
          id: 'al2',
          level: 'warning',
          source: '设备 DEV-1024',
          message: 'CPU 占用持续高于 85%',
          time: '14:28:15',
          resolved: false,
        },
        {
          id: 'al3',
          level: 'warning',
          source: '能耗系统',
          message: '楼宇 B-03 温度异常 28.4°C',
          time: '14:15:48',
          resolved: false,
        },
        {
          id: 'al4',
          level: 'info',
          source: '设备 DEV-1003',
          message: '设备离线 5 分钟后已恢复',
          time: '13:50:21',
          resolved: true,
        },
      ],
    }),
  },
  // 能耗趋势
  {
    url: '/api/dashboard/energy-trend',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'ok',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        values: [320, 380, 410, 360, 420, 280, 240],
      },
    }),
  },
  // 园区分布
  {
    url: '/api/dashboard/distribution',
    method: 'get',
    response: () => ({
      code: 0,
      message: 'ok',
      data: [
        { name: 'A区', value: 42, coord: [116.4, 39.9] },
        { name: 'B区', value: 38, coord: [116.5, 39.9] },
        { name: 'C区', value: 51, coord: [116.4, 39.95] },
      ],
    }),
  },
] as MockMethod[]
