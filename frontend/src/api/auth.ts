import apiClient from './client'
import type { ApiResponse, LoginResponse, RegisterResponse, User } from '@/types'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  nickname: string
}

// 用户注册
export const register = (params: RegisterParams): Promise<ApiResponse<RegisterResponse>> => {
  return apiClient.post('/auth/register', params)
}

// 用户登录
export const login = (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  return apiClient.post('/auth/login', params)
}

// 刷新Token
export const refreshToken = (refresh_token: string) => {
  return apiClient.post('/auth/refresh', { refresh_token })
}

// 获取用户信息
export const getProfile = (): Promise<ApiResponse<User>> => {
  return apiClient.get('/user/profile')
}

// 更新用户信息
export const updateProfile = (params: { nickname?: string; avatar_url?: string }): Promise<ApiResponse<User>> => {
  return apiClient.put('/user/profile', params)
}
