import type { MockMethod } from 'vite-plugin-mock'
import type { StockItem, StockMove, Supplier } from '../src/types/supply'

const SUPPLIERS: Supplier[] = [
  {
    id: 's1',
    name: '华为技术',
    contact: '李伟',
    phone: '139****1001',
    email: 'liwei@hw.com',
    level: 'a',
    materialCount: 18,
    status: 'enabled',
    createdAt: '2024-03-15',
  },
  {
    id: 's2',
    name: '海康威视',
    contact: '王芳',
    phone: '139****1002',
    email: 'wangfang@hikvision.com',
    level: 'a',
    materialCount: 24,
    status: 'enabled',
    createdAt: '2024-05-20',
  },
  {
    id: 's3',
    name: '大华股份',
    contact: '张涛',
    phone: '139****1003',
    level: 'b',
    materialCount: 12,
    status: 'enabled',
    createdAt: '2024-08-10',
  },
  {
    id: 's4',
    name: '本地五金供应',
    contact: '陈秀',
    phone: '139****1004',
    level: 'c',
    materialCount: 35,
    status: 'enabled',
    createdAt: '2025-01-05',
  },
  {
    id: 's5',
    name: '智控电气',
    contact: '刘强',
    phone: '139****1005',
    level: 'b',
    materialCount: 9,
    status: 'disabled',
    createdAt: '2025-02-18',
  },
]

const stocks: StockItem[] = [
  {
    id: 'st1',
    sku: 'CAM-001',
    name: '高清监控摄像头',
    category: 'equipment',
    unit: '台',
    quantity: 156,
    safetyStock: 50,
    price: 880,
    warehouse: 'A库',
    supplierId: 's2',
    supplierName: '海康威视',
    lastInAt: '2026-07-01',
    lastOutAt: '2026-07-05',
  },
  {
    id: 'st2',
    sku: 'SEN-002',
    name: '温湿度传感器',
    category: 'equipment',
    unit: '个',
    quantity: 42,
    safetyStock: 60,
    price: 120,
    warehouse: 'A库',
    supplierId: 's1',
    supplierName: '华为技术',
    lastInAt: '2026-06-28',
    lastOutAt: '2026-07-06',
  },
  {
    id: 'st3',
    sku: 'MTR-003',
    name: '智能电表',
    category: 'equipment',
    unit: '台',
    quantity: 280,
    safetyStock: 100,
    price: 450,
    warehouse: 'B库',
    supplierId: 's1',
    supplierName: '华为技术',
    lastInAt: '2026-07-02',
    lastOutAt: '2026-07-04',
  },
  {
    id: 'st4',
    sku: 'CBL-004',
    name: '网线 Cat6 (305m/箱)',
    category: 'consumable',
    unit: '箱',
    quantity: 8,
    safetyStock: 20,
    price: 580,
    warehouse: 'B库',
    supplierId: 's4',
    supplierName: '本地五金供应',
    lastInAt: '2026-06-15',
    lastOutAt: '2026-07-03',
  },
  {
    id: 'st5',
    sku: 'BAT-005',
    name: 'UPS 电池组',
    category: 'spare',
    unit: '组',
    quantity: 0,
    safetyStock: 5,
    price: 2200,
    warehouse: 'C库',
    supplierId: 's5',
    supplierName: '智控电气',
    lastInAt: '2026-05-20',
    lastOutAt: '2026-06-30',
  },
  {
    id: 'st6',
    sku: 'PRT-006',
    name: '热敏打印机',
    category: 'equipment',
    unit: '台',
    quantity: 24,
    safetyStock: 10,
    price: 380,
    warehouse: 'A库',
    supplierId: 's3',
    supplierName: '大华股份',
    lastInAt: '2026-06-25',
    lastOutAt: '2026-07-01',
  },
  {
    id: 'st7',
    sku: 'CAB-007',
    name: '弱电箱 (400×600)',
    category: 'consumable',
    unit: '个',
    quantity: 78,
    safetyStock: 30,
    price: 180,
    warehouse: 'B库',
    supplierId: 's4',
    supplierName: '本地五金供应',
    lastInAt: '2026-07-03',
  },
  {
    id: 'st8',
    sku: 'SOK-008',
    name: '智能插座',
    category: 'equipment',
    unit: '个',
    quantity: 320,
    safetyStock: 100,
    price: 85,
    warehouse: 'A库',
    supplierId: 's1',
    supplierName: '华为技术',
    lastInAt: '2026-07-04',
    lastOutAt: '2026-07-06',
  },
  {
    id: 'st9',
    sku: 'SCR-009',
    name: '触控屏 7寸',
    category: 'equipment',
    unit: '块',
    quantity: 12,
    safetyStock: 15,
    price: 560,
    warehouse: 'A库',
    supplierId: 's2',
    supplierName: '海康威视',
    lastInAt: '2026-06-20',
  },
  {
    id: 'st10',
    sku: 'PWR-010',
    name: '电源适配器 12V',
    category: 'spare',
    unit: '个',
    quantity: 85,
    safetyStock: 40,
    price: 45,
    warehouse: 'C库',
    supplierId: 's3',
    supplierName: '大华股份',
    lastInAt: '2026-07-02',
    lastOutAt: '2026-07-05',
  },
]

let moves: StockMove[] = Array.from({ length: 25 }, (_, i) => {
  const stock = stocks[i % stocks.length]
  const types = ['in', 'out', 'out', 'in', 'out'] as const
  const type = types[i % types.length]
  const qty = Math.floor(Math.random() * 30) + 1
  const d = new Date(Date.now() - i * 3600000 * 5)
  return {
    id: `mv-${i + 1}`,
    sku: stock.sku,
    materialName: stock.name,
    type,
    quantity: qty,
    unit: stock.unit,
    balance: stock.quantity + (type === 'in' ? qty : -qty),
    operator: ['张明', '李娜', '王强', '赵敏'][i % 4],
    remark: type === 'in' ? '采购入库' : '领用出库',
    createdAt: d.toLocaleString('zh-CN'),
  }
})

function getStockStatus(item: StockItem) {
  if (item.quantity === 0) return 'out'
  if (item.quantity < item.safetyStock * 0.5) return 'warning'
  if (item.quantity < item.safetyStock) return 'low'
  return 'sufficient'
}

/** 安全包装：避免单个 mock response 抛异常导致整个 dev server 崩溃 */
function safe(handler: () => any): any {
  try {
    return handler()
  } catch (e) {
    console.error('[mock/supply] response error:', e)
    return { code: 500, message: 'Mock 服务内部错误', data: null }
  }
}

export default [
  // ============ 库存列表 ============
  {
    url: '/api/supply/stock/list',
    method: 'get',
    response: ({ query }: { query: any }) =>
      safe(() => {
        const { page = 1, pageSize = 10, keyword, category, status } = query || {}
        let list = stocks
        if (keyword) list = list.filter((s) => s.name.includes(keyword) || s.sku.includes(keyword))
        if (category) list = list.filter((s) => s.category === category)
        if (status) list = list.filter((s) => getStockStatus(s) === status)
        const total = list.length
        const start = (Number(page) - 1) * Number(pageSize)
        return {
          code: 0,
          message: 'ok',
          data: {
            list: list
              .slice(start, start + Number(pageSize))
              .map((s) => ({ ...s, status: getStockStatus(s) })),
            total,
            page: Number(page),
            pageSize: Number(pageSize),
          },
        }
      }),
  },
  {
    url: '/api/supply/stock/stats',
    method: 'get',
    response: () =>
      safe(() => {
        const total = stocks.length
        const lowCount = stocks.filter((s) =>
          ['low', 'warning', 'out'].includes(getStockStatus(s))
        ).length
        const outCount = stocks.filter((s) => getStockStatus(s) === 'out').length
        const totalValue = stocks.reduce((sum, s) => sum + s.quantity * s.price, 0)
        return { code: 0, message: 'ok', data: { total, lowCount, outCount, totalValue } }
      }),
  },
  {
    url: '/api/supply/stock/move',
    method: 'post',
    response: ({
      body,
    }: {
      body: { id?: string; type?: 'in' | 'out'; quantity?: number; remark?: string }
    }) =>
      safe(() => {
        if (!body?.id || !body.type) {
          return { code: 400, message: '缺少 id 或 type', data: null }
        }
        const stock = stocks.find((s) => s.id === body.id)
        if (!stock) return { code: 1, message: '物资不存在', data: null }
        const qty = Number(body.quantity) || 0
        const delta = body.type === 'in' ? qty : -qty
        if (stock.quantity + delta < 0) return { code: 1, message: '库存不足', data: null }
        stock.quantity += delta
        const move: StockMove = {
          id: `mv-${Date.now()}`,
          sku: stock.sku,
          materialName: stock.name,
          type: body.type,
          quantity: qty,
          unit: stock.unit,
          balance: stock.quantity,
          operator: '当前用户',
          remark: body.remark || (body.type === 'in' ? '入库' : '出库'),
          createdAt: new Date().toLocaleString('zh-CN'),
        }
        moves = [move, ...moves]
        if (body.type === 'in') stock.lastInAt = new Date().toLocaleDateString('zh-CN')
        else stock.lastOutAt = new Date().toLocaleDateString('zh-CN')
        return { code: 0, message: 'ok', data: null }
      }),
  },
  // ============ 出入库记录 ============
  {
    url: '/api/supply/move/list',
    method: 'get',
    response: ({ query }: { query: any }) =>
      safe(() => {
        const { page = 1, pageSize = 10, type } = query || {}
        let list = moves
        if (type) list = list.filter((m) => m.type === type)
        const total = list.length
        const start = (Number(page) - 1) * Number(pageSize)
        return {
          code: 0,
          message: 'ok',
          data: {
            list: list.slice(start, start + Number(pageSize)),
            total,
            page: Number(page),
            pageSize: Number(pageSize),
          },
        }
      }),
  },
  // ============ 供应商 ============
  {
    url: '/api/supply/supplier/list',
    method: 'get',
    response: ({ query }: { query: any }) =>
      safe(() => {
        const kw = query?.keyword
        const list = kw
          ? SUPPLIERS.filter((s) => s.name.includes(kw) || s.contact.includes(kw))
          : SUPPLIERS
        return { code: 0, message: 'ok', data: list }
      }),
  },
] as MockMethod[]
