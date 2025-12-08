import apiClient from './client'
import type { ApiResponse, SkillCard, CreateSkillCardParams, UpdateSkillCardParams } from '@/types'

export const createSkillCard = (params: CreateSkillCardParams): Promise<ApiResponse<SkillCard>> => {
  return apiClient.post('/skill-cards', params)
}

export const listSkillCards = (category?: string, query?: string): Promise<ApiResponse<SkillCard[]>> => {
  return apiClient.get('/skill-cards', { params: { category, q: query } })
}

export const listSystemSkillCards = (): Promise<ApiResponse<SkillCard[]>> => {
  return apiClient.get('/skill-cards/system')
}

export const getSkillCardById = (id: string): Promise<ApiResponse<SkillCard>> => {
  return apiClient.get(`/skill-cards/${id}`)
}

export const updateSkillCard = (id: string, params: UpdateSkillCardParams): Promise<ApiResponse<SkillCard>> => {
  return apiClient.put(`/skill-cards/${id}`, params)
}

export const deleteSkillCard = (id: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/skill-cards/${id}`)
}
