/** 物资类型 */
export type MaterialCategory = 'equipment' | 'consumable' | 'spare' | 'other'

/** 库存状态 */
export type StockStatus = 'sufficient' | 'low' | 'warning' | 'out'

/** 出入库类型 */
export type StockMoveType = 'in' | 'out' | 'adjust'

/** 物资/库存项 */
export interface StockItem {
  id: string
  sku: string
  name: string
  category: MaterialCategory
  unit: string
  /** 当前库存 */
  quantity: number
  /** 安全库存阈值 */
  safetyStock: number
  /** 单价 */
  price: number
  /** 存放仓库 */
  warehouse: string
  /** 供应商 */
  supplierId?: string
  supplierName?: string
  lastInAt?: string
  lastOutAt?: string
}

/** 出入库记录 */
export interface StockMove {
  id: string
  sku: string
  materialName: string
  type: StockMoveType
  quantity: number
  unit: string
  /** 操作后库存 */
  balance: number
  operator: string
  remark?: string
  createdAt: string
}

/** 供应商 */
export interface Supplier {
  id: string
  name: string
  contact: string
  phone: string
  email?: string
  address?: string
  level: 'a' | 'b' | 'c'
  materialCount: number
  status: 'enabled' | 'disabled'
  createdAt: string
}
