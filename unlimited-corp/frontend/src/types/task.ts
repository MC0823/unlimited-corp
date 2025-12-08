// 任务状态
export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// 任务
export interface Task {
  id: string
  company_id: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  progress: number
  workflow_definition?: WorkflowDefinition
  assigned_employee_id?: string
  assigned_employee?: {
    id: string
    name: string
    avatar_url: string
  }
  input_data: Record<string, unknown>
  output_data?: Record<string, unknown>
  error_message?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// 工作流定义
export interface WorkflowDefinition {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

// 工作流节点
export interface WorkflowNode {
  id: string
  type: 'start' | 'end' | 'skill' | 'condition' | 'parallel'
  name: string
  skill_card_id?: string
  config?: Record<string, unknown>
  position: { x: number; y: number }
}

// 工作流边
export interface WorkflowEdge {
  id: string
  source: string
  target: string
  condition?: string
}

// 任务步骤
export interface TaskStep {
  id: string
  task_id: string
  step_order: number
  name: string
  skill_card_id?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  input_data?: Record<string, unknown>
  output_data?: Record<string, unknown>
  error_message?: string
  started_at?: string
  completed_at?: string
}
