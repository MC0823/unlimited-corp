import apiClient from './client'
import type { ApiResponse, ChatSession, ChatMessage, CreateSessionParams, CreateMessageParams } from '@/types'

export const createSession = (params: CreateSessionParams): Promise<ApiResponse<ChatSession>> => {
  return apiClient.post('/chat/sessions', params)
}

export const listSessions = (companyId: string, limit = 20, offset = 0): Promise<ApiResponse<ChatSession[]>> => {
  return apiClient.get('/chat/sessions', { params: { company_id: companyId, limit, offset } })
}

export const getSessionById = (id: string): Promise<ApiResponse<ChatSession>> => {
  return apiClient.get(`/chat/sessions/${id}`)
}

export const deleteSession = (id: string): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/chat/sessions/${id}`)
}

export const createMessage = (params: CreateMessageParams): Promise<ApiResponse<ChatMessage>> => {
  return apiClient.post('/chat/messages', params)
}

export const listMessages = (sessionId: string, limit = 50, offset = 0): Promise<ApiResponse<ChatMessage[]>> => {
  return apiClient.get(`/chat/sessions/${sessionId}/messages`, { params: { limit, offset } })
}
