export * from './user'
export * from './employee'
export * from './task'

// API响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// 分页参数
export interface PaginationParams {
  page?: number
  page_size?: number
}
