import request from './request'
import type {
  StockItem,
  StockMove,
  Supplier,
  MaterialCategory,
  StockMoveType,
  StockStatus,
} from '@/types/supply'
import type { PaginatedData } from '@/types/global'

export interface StockQuery {
  page: number
  pageSize: number
  keyword?: string
  category?: MaterialCategory
  status?: StockStatus
  [key: string]: unknown
}

export interface StockStats {
  total: number
  lowCount: number
  outCount: number
  totalValue: number
}

// ============ 库存 ============
export const getStockList = (params: StockQuery) =>
  request.get<PaginatedData<StockItem & { status: StockStatus }>>('/supply/stock/list', { params })

export const getStockStats = () => request.get<StockStats>('/supply/stock/stats')

export const moveStock = (data: {
  id: string
  type: 'in' | 'out'
  quantity: number
  remark?: string
}) => request.post<void>('/supply/stock/move', data)

// ============ 出入库记录 ============
export interface MoveQuery {
  page: number
  pageSize: number
  type?: StockMoveType
  [key: string]: unknown
}

export const getMoveList = (params: MoveQuery) =>
  request.get<PaginatedData<StockMove>>('/supply/move/list', { params })

// ============ 供应商 ============
export const getSupplierList = (keyword?: string) =>
  request.get<Supplier[]>('/supply/supplier/list', { params: { keyword } })
