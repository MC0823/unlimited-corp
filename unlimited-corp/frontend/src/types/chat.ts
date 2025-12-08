export interface ChatSession {
  id: string
  company_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  actions: unknown[]
  created_at: string
}

export interface CreateSessionParams {
  company_id: string
  title: string
}

export interface CreateMessageParams {
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}
