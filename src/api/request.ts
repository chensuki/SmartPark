import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import NProgress from 'nprogress'
import type { ApiResponse } from '@/types/global'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

/** 业务约定：code === 0 为成功 */
const SUCCESS_CODE = 0

/** 是否开启 loading（同源并发合并） */
let loadingCount = 0

function showLoading() {
  if (loadingCount === 0) NProgress.start()
  loadingCount++
}

function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0) NProgress.done()
}

/** 扩展配置：是否静默、是否跳过错误提示、是否显示 loading */
interface RequestOptions {
  /** 跳过全局错误提示，由调用方自行处理 */
  silent?: boolean
  /** 不显示顶部进度条 */
  noLoading?: boolean
  /** 鉴权 token 覆盖（极少用） */
  token?: string
}

export type RequestConfig = AxiosRequestConfig & RequestOptions

// =========================================================================
// 创建实例
// =========================================================================
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// =========================================================================
// 请求拦截器：注入 token、loading
// =========================================================================
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const opts = config as InternalAxiosRequestConfig & RequestOptions
    if (!opts.noLoading) showLoading()

    const token = opts.token || localStorage.getItem('sp_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    hideLoading()
    return Promise.reject(error)
  },
)

// =========================================================================
// 响应拦截器：统一错误处理、数据解包
// =========================================================================
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    hideLoading()
    const opts = response.config as AxiosRequestConfig & RequestOptions
    const res = response.data

    // 直接返回二进制等非标准结构（如导出文件）
    if (response.config.responseType === 'blob') {
      return response
    }

    // 业务码非 0：进入错误流程
    if (res.code !== SUCCESS_CODE) {
      if (!opts.silent) {
        // 401：登录失效
        if (res.code === 401) {
          handleUnauthorized()
        } else {
          ElMessage.error(res.message || `请求失败 (code: ${res.code})`)
        }
      }
      return Promise.reject(new Error(res.message || 'Error'))
    }

    // 把业务数据塞回 response.data，让 request() 函数能拿到解包后的结构
    response.data = res as unknown as AxiosResponse['data']
    return response
  },
  (error) => {
    hideLoading()
    const opts = (error.config || {}) as RequestOptions
    const status = error.response?.status

    let msg = '网络异常，请稍后重试'
    if (status === 401) {
      handleUnauthorized()
      msg = '登录已失效，请重新登录'
    } else if (status === 403) {
      msg = '没有权限访问该资源'
    } else if (status === 404) {
      msg = '请求的资源不存在'
    } else if (status && status >= 500) {
      msg = '服务器异常，请稍后重试'
    } else if (error.code === 'ECONNABORTED') {
      msg = '请求超时，请检查网络'
    }

    if (!opts.silent) ElMessage.error(msg)
    return Promise.reject(error)
  },
)

/** 401 统一处理：清 token + 弹窗 + 跳登录（防止多次弹窗） */
let unauthorizedShown = false
function handleUnauthorized() {
  if (unauthorizedShown) return
  unauthorizedShown = true
  localStorage.removeItem('sp_token')
  ElMessageBox.confirm('登录状态已失效，请重新登录', '提示', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      window.location.href = '/login'
    })
    .finally(() => {
      unauthorizedShown = false
    })
}

// =========================================================================
// 对外暴露的请求方法（自动解包 data）
// =========================================================================
function request<T = unknown>(config: RequestConfig): Promise<T> {
  return service(config).then((res) => (res.data as ApiResponse<T>).data)
}

request.get = <T = unknown>(url: string, config?: RequestConfig) =>
  request<T>({ ...config, method: 'GET', url })

request.post = <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
  request<T>({ ...config, method: 'POST', url, data })

request.put = <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
  request<T>({ ...config, method: 'PUT', url, data })

request.delete = <T = unknown>(url: string, config?: RequestConfig) =>
  request<T>({ ...config, method: 'DELETE', url })

export default request
