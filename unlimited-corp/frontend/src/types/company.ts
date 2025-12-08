export interface Company {
  id: string
  user_id: string
  name: string
  description: string
  logo_url: string
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CreateCompanyParams {
  name: string
  description?: string
  logo_url?: string
  settings?: Record<string, unknown>
}

export interface UpdateCompanyParams {
  name?: string
  description?: string
  logo_url?: string
  settings?: Record<string, unknown>
}
