// 员工状态
export type EmployeeStatus = 'idle' | 'working' | 'offline' | 'error'

// 技能卡摘要
export interface SkillCardSummary {
  id: string
  name: string
  category: string
  icon?: string
}

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
