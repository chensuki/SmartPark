import { reactive, ref } from 'vue'
import type { PageQuery, PaginatedData } from '@/types/global'

/**
 * 通用表格逻辑封装（分页、查询、loading）
 *
 * @example
 * const { data, loading, query, refresh, handlePageChange } = useTable(fetchUserList)
 * // 自定义查询参数类型
 * useTable<User, UserQuery>(getUserList)
 */
export function useTable<T, Q extends PageQuery = PageQuery>(
  fetcher: (params: Q) => Promise<PaginatedData<T>>,
  defaultQuery: Partial<Q> = {}
) {
  const loading = ref(false)
  const data = ref<T[]>([]) as ReturnType<typeof ref<T[]>>
  const total = ref(0)

  const query = reactive({
    page: 1,
    pageSize: 10,
    ...defaultQuery,
  }) as unknown as Q

  async function refresh() {
    loading.value = true
    try {
      const res = await fetcher({ ...query } as Q)
      data.value = res.list
      total.value = res.total
    } catch (e) {
      console.error('[useTable] fetch error:', e)
    } finally {
      loading.value = false
    }
  }

  function handlePageChange(page: number) {
    query.page = page
    refresh()
  }

  function handleSizeChange(size: number) {
    query.pageSize = size
    query.page = 1
    refresh()
  }

  function handleSearch() {
    query.page = 1
    refresh()
  }

  function handleReset() {
    Object.keys(query).forEach((key) => {
      if (key !== 'page' && key !== 'pageSize') {
        ;(query as Record<string, unknown>)[key] = undefined
      }
    })
    query.page = 1
    refresh()
  }

  return {
    loading,
    data,
    total,
    query,
    refresh,
    handlePageChange,
    handleSizeChange,
    handleSearch,
    handleReset,
  }
}
