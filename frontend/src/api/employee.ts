import apiClient from './client'
import type { ApiResponse, Employee } from '@/types'

export interface CreateEmployeeParams {
  name: string
  description?: string
  avatar_url?: string
  config?: Record<string, any>
}

export interface UpdateEmployeeParams {
  name?: string
  description?: string
  avatar_url?: string
  config?: Record<string, any>
}

export interface AssignSkillParams {
  skill_card_id: string
}

export const createEmployee = (params: CreateEmployeeParams): Promise<ApiResponse<Employee>> => {
  return apiClient.post('/employees', params)
}

export const listEmployees = (): Promise<ApiResponse<Employee[]>> => {
  return apiClient.get('/employees')
}

export const getEmployeeById = (id: string): Promise<ApiResponse<Employee>> => {
  return apiClient.get(`/employees/${id}`)
}

export const updateEmployee = (id: string, params: UpdateEmployeeParams): Promise<ApiResponse<Employee>> => {
  return apiClient.put(`/employees/${id}`, params)
}

export const deleteEmployee = (id: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/employees/${id}`)
}

export const assignSkill = (id: string, params: AssignSkillParams): Promise<ApiResponse<void>> => {
  return apiClient.post(`/employees/${id}/skills`, params)
}
