import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token?.access_token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config
    
    // 401错误且有refresh token时尝试刷新
    if (error.response?.status === 401 && originalRequest) {
      const refreshToken = useAuthStore.getState().token?.refresh_token
      
      if (refreshToken) {
        try {
          const response = await axios.post('/api/v1/auth/refresh', {
            refresh_token: refreshToken,
          })
          
          const newToken = response.data.data
          useAuthStore.getState().setToken(newToken)
          
          // 重试原请求
          originalRequest.headers.Authorization = `Bearer ${newToken.access_token}`
          return apiClient(originalRequest)
        } catch {
          // 刷新失败，退出登录
          useAuthStore.getState().logout()
        }
      } else {
        useAuthStore.getState().logout()
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
