export interface SkillCard {
  id: string
  company_id: string
  name: string
  description: string
  category: string
  config: Record<string, any>
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface CreateSkillCardParams {
  name: string
  description: string
  category: string
  config?: Record<string, any>
}

export interface UpdateSkillCardParams {
  name?: string
  description?: string
  category?: string
  config?: Record<string, any>
}
