import apiClient from './client'
import type { ApiResponse, Task } from '@/types'

export interface CreateTaskParams {
  company_id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
}

export interface UpdateTaskParams {
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  progress?: number
}

export interface UpdateTaskStatusParams {
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
}

export const createTask = (params: CreateTaskParams): Promise<ApiResponse<Task>> => {
  return apiClient.post('/tasks', params)
}

export const listTasks = (companyId: string): Promise<ApiResponse<Task[]>> => {
  return apiClient.get('/tasks', { params: { company_id: companyId } })
}

export const getTaskById = (id: string): Promise<ApiResponse<Task>> => {
  return apiClient.get(`/tasks/${id}`)
}

export const updateTask = (id: string, params: UpdateTaskParams): Promise<ApiResponse<Task>> => {
  return apiClient.put(`/tasks/${id}`, params)
}

export const updateTaskStatus = (id: string, params: UpdateTaskStatusParams): Promise<ApiResponse<Task>> => {
  return apiClient.patch(`/tasks/${id}/status`, params)
}

export const deleteTask = (id: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/tasks/${id}`)
}
