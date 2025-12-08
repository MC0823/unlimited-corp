/**
 * 虚拟办公室模拟数据
 * 
 * TODO: 后续需要替换为从后端API获取的真实数据
 * - 部门数据应从 /api/v1/departments 获取
 * - 员工数据应从 /api/v1/employees 获取
 * - 任务数据应从 /api/v1/tasks 获取
 * - 秘书数据可能需要新增API或使用技能卡相关接口
 */

import type { Department, Employee, Task, Secretary } from '../types/office'

/**
 * 默认部门数据
 * 当API不可用或首次加载时使用
 */
export const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: '技术部', icon: '💻', color: '#3D7FFF', description: '负责产品研发与技术支持' },
  { id: 'dept-2', name: '设计部', icon: '🎨', color: '#FF6B9D', description: '负责UI/UX设计与品牌视觉' },
  { id: 'dept-3', name: '市场部', icon: '📢', color: '#FFD93D', description: '负责市场推广与运营' },
  { id: 'dept-4', name: '数据部', icon: '📊', color: '#4ECDC4', description: '负责数据分析与决策支持' },
]

/**
 * 默认员工数据
 */
export const DEFAULT_EMPLOYEES: Employee[] = [
  { 
    id: '1', 
    name: 'Alice Chen', 
    role: 'developer', 
    status: 'working', 
    skills: ['React', 'TypeScript'], 
    performance: 92, 
    currentTask: 'task-1', 
    avatarColor: '#FF6B9D', 
    position: { x: 25, y: 40 }, 
    departmentId: 'dept-1' 
  },
  { 
    id: '2', 
    name: 'Bob Liu', 
    role: 'designer', 
    status: 'idle', 
    skills: ['UI/UX', 'Figma'], 
    performance: 88, 
    avatarColor: '#4ECDC4', 
    position: { x: 40, y: 40 }, 
    departmentId: 'dept-2' 
  },
  { 
    id: '3', 
    name: 'Carol Wang', 
    role: 'marketer', 
    status: 'working', 
    skills: ['SEO', 'Content'], 
    performance: 85, 
    currentTask: 'task-2', 
    avatarColor: '#FFD93D', 
    position: { x: 55, y: 40 }, 
    departmentId: 'dept-3' 
  },
  { 
    id: '4', 
    name: 'David Zhang', 
    role: 'analyst', 
    status: 'tired', 
    skills: ['Data', 'SQL'], 
    performance: 90, 
    avatarColor: '#A8E6CF', 
    position: { x: 70, y: 40 }, 
    departmentId: 'dept-4' 
  },
  { 
    id: '5', 
    name: 'Emma Li', 
    role: 'developer', 
    status: 'working', 
    skills: ['Python', 'AI'], 
    performance: 94, 
    currentTask: 'task-3', 
    avatarColor: '#C7CEEA', 
    position: { x: 25, y: 55 }, 
    departmentId: 'dept-1' 
  },
  { 
    id: '6', 
    name: 'Frank Wu', 
    role: 'designer', 
    status: 'idle', 
    skills: ['Branding', 'Animation'], 
    performance: 87, 
    avatarColor: '#FFDAB9', 
    position: { x: 40, y: 55 }, 
    departmentId: 'dept-2' 
  },
]

/**
 * 默认任务数据
 */
export const DEFAULT_TASKS: Task[] = [
  { 
    id: 'task-1', 
    title: '开发新功能模块', 
    status: 'in-progress', 
    assignee: '1', 
    priority: 'high', 
    progress: 65, 
    description: '实现用户管理系统的核心功能' 
  },
  { 
    id: 'task-2', 
    title: '市场推广方案', 
    status: 'in-progress', 
    assignee: '3', 
    priority: 'medium', 
    progress: 40, 
    description: '制定Q4季度营销策略' 
  },
  { 
    id: 'task-3', 
    title: 'AI模型优化', 
    status: 'in-progress', 
    assignee: '5', 
    priority: 'high', 
    progress: 78, 
    description: '提升模型准确率到95%以上' 
  },
  { 
    id: 'task-4', 
    title: '界面设计优化', 
    status: 'pending', 
    priority: 'low', 
    progress: 0, 
    description: '重新设计产品主页面' 
  },
  { 
    id: 'task-5', 
    title: '数据分析报告', 
    status: 'completed', 
    priority: 'medium', 
    progress: 100, 
    description: '生成月度运营数据报告' 
  },
]

/**
 * 默认秘书数据
 */
export const DEFAULT_SECRETARIES: Secretary[] = [
  { id: 's1', name: '商务秘书 Linda', type: 'business', avatar: '📊', status: '已准备3份报告' },
  { id: 's2', name: '生活秘书 Sophia', type: 'life', avatar: '☕', status: '今日行程已安排' },
  { id: 's3', name: '私人秘书 Grace', type: 'personal', avatar: '🎧', status: '待处理消息 5 条' },
]

/**
 * 生成唯一ID
 */
export const generateId = (): string => Math.random().toString(36).substring(2, 9)
