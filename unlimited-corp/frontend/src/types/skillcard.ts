// 技能卡类别 - 根据设计文档
export type SkillCategory = 
  | 'creative'     // 创意策略
  | 'collection'   // 素材获取
  | 'content'      // 内容创作
  | 'visual'       // 视觉设计
  | 'optimize'     // 优化质检
  | 'publish'      // 发布运营
  | 'delivery'     // 合成交付

// 技能卡内核类型
export type KernelType = 'ai_model' | 'code_logic' | 'hybrid'

// AI模型类型
export type AIModel = 'gpt-4' | 'gpt-3.5' | 'claude-3' | 'claude-2' | 'dall-e-3' | 'dall-e-2'

// 代码运行时
export type CodeRuntime = 'python' | 'javascript'

// 技能卡状态
export type SkillStatus = 'draft' | 'published' | 'deprecated'

// JSON Schema 类型定义
export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  title?: string
  description?: string
  enum?: (string | number | boolean)[]
  default?: any
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  items?: JSONSchemaProperty
  properties?: Record<string, JSONSchemaProperty>
  required?: string[]
}

export interface JSONSchema {
  type: 'object'
  title?: string
  description?: string
  properties: Record<string, JSONSchemaProperty>
  required?: string[]
}

// AI模型配置
export interface AIModelConfig {
  modelId: AIModel
  systemPrompt: string
  userPromptTemplate: string
  temperature?: number  // 0.0-2.0, 默认1.0
  maxTokens?: number
}

// 代码逻辑配置
export interface CodeLogicConfig {
  runtime: CodeRuntime
  code: string
  dependencies?: string[]
}

// 统一的内核配置
export type KernelConfig = AIModelConfig | CodeLogicConfig

export interface SkillCard {
  id: string
  company_id: string
  name: string
  description: string
  category: SkillCategory
  icon?: string
  kernel_type: KernelType
  kernel_config: Record<string, unknown>
  input_schema?: JSONSchema
  output_schema?: JSONSchema
  is_system: boolean
  is_public: boolean
  status: SkillStatus
  version: string
  usage_count: number
  success_rate: number
  created_at: string
  updated_at: string
}

export interface CreateSkillCardParams {
  name: string
  description: string
  category: SkillCategory
  icon?: string
  kernel_type: KernelType
  kernel_config: Record<string, unknown>
  input_schema?: JSONSchema
  output_schema?: JSONSchema
}

export interface UpdateSkillCardParams {
  name?: string
  description?: string
  category?: SkillCategory
  icon?: string
  kernel_type?: KernelType
  kernel_config?: Record<string, unknown>
  input_schema?: JSONSchema
  output_schema?: JSONSchema
}

// 技能卡工坊表单数据
export interface SkillCardFormData {
  // 基础信息
  name: string
  description: string
  category: SkillCategory
  icon?: string
  
  // 内核配置
  kernel_type: KernelType
  
  // AI模型配置
  ai_model?: AIModel
  system_prompt?: string
  user_prompt_template?: string
  temperature?: number
  max_tokens?: number
  
  // 代码逻辑配置
  code_runtime?: CodeRuntime
  code?: string
  dependencies?: string[]
  
  // Schema定义
  input_schema?: JSONSchema
  output_schema?: JSONSchema
  
  // 测试数据
  test_input?: Record<string, unknown>
}
