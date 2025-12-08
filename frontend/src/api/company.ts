import apiClient from './client'
import type { ApiResponse, Company, CreateCompanyParams, UpdateCompanyParams } from '@/types'

export const createCompany = (params: CreateCompanyParams): Promise<ApiResponse<Company>> => {
  return apiClient.post('/companies', params)
}

export const getMyCompany = (): Promise<ApiResponse<Company>> => {
  return apiClient.get('/companies/my')
}

export const getCompanyById = (id: string): Promise<ApiResponse<Company>> => {
  return apiClient.get(`/companies/${id}`)
}

export const updateCompany = (id: string, params: UpdateCompanyParams): Promise<ApiResponse<Company>> => {
  return apiClient.put(`/companies/${id}`, params)
}

export const deleteCompany = (id: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/companies/${id}`)
}
