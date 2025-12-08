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

export type SkillCategory = 'creative' | 'collection' | 'content' | 'visual' | 'optimize' | 'publish' | 'delivery'
export type AIModel = 'gpt-4' | 'gpt-3.5' | 'claude-3' | 'claude-2' | 'dall-e-3' | 'dall-e-2'
export type CodeRuntime = 'python' | 'javascript'

export interface JSONSchemaProperty {
  type: string
  title: string
}

export interface JSONSchema {
  type: string
  properties: Record<string, JSONSchemaProperty>
  required?: string[]
}

export interface SkillCardFormData {
  name: string
  description: string
  category: SkillCategory
  kernel_type: 'ai_model' | 'code_logic'
  ai_model?: AIModel
  system_prompt?: string
  user_prompt_template?: string
  temperature?: number
  max_tokens?: number
  code_runtime?: CodeRuntime
  code?: string
  dependencies?: string[]
  test_input?: string
}
