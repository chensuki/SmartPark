import { reactive, ref } from 'vue'
import type { PageQuery, PaginatedData } from '@/types/global'

/**
 * 通用表格逻辑封装（分页、查询、loading）
 *
 * @example
 * const { data, loading, query, refresh, handlePageChange } = useTable(fetchUserList)
 */
export function useTable<T>(
  fetcher: (params: PageQuery) => Promise<PaginatedData<T>>,
  defaultQuery: Partial<PageQuery> = {}
) {
  const loading = ref(false)
  const data = ref<T[]>([]) as ReturnType<typeof ref<T[]>>
  const total = ref(0)

  const query = reactive<PageQuery>({
    page: 1,
    pageSize: 10,
    ...defaultQuery,
  })

  async function refresh() {
    loading.value = true
    try {
      const res = await fetcher({ ...query })
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
