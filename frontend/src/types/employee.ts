// 员工状态
export type EmployeeStatus = 'idle' | 'working' | 'offline' | 'error'

// 员工类型
export interface Employee {
  id: string
  company_id: string
  name: string
  role: string
  avatar_url: string
  personality: string
  status: EmployeeStatus
  current_task_id?: string
  total_tasks: number
  success_rate: number
  skill_cards: SkillCardSummary[]
  created_at: string
  updated_at: string
}

// 技能卡摘要
export interface SkillCardSummary {
  id: string
  name: string
  category: string
  icon?: string
}

// 技能卡类别
export type SkillCategory = 'research' | 'creation' | 'analysis' | 'execution' | 'communication'

// 技能卡内核类型
export type KernelType = 'ai_model' | 'code_logic' | 'hybrid'

// 技能卡
export interface SkillCard {
  id: string
  company_id: string
  name: string
  description: string
  category: SkillCategory
  icon?: string
  kernel_type: KernelType
  kernel_config: Record<string, unknown>
  input_schema: Record<string, unknown>
  output_schema: Record<string, unknown>
  is_system: boolean
  is_public: boolean
  version: string
  usage_count: number
  success_rate: number
  created_at: string
  updated_at: string
}
