export type EmployeeStatus = 'idle' | 'working' | 'tired';
export type EmployeeRole = 'developer' | 'designer' | 'marketer' | 'analyst';

// 部门类型定义
export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  skills: string[];
  performance: number;
  currentTask?: string;
  avatarColor: string;
  position: { x: number; y: number };
  departmentId: string; // 所属部门ID
  avatar?: QAvatar; // Q版形象配置
}

// Q版形象配置
export interface QAvatar {
  headShape: 'round' | 'square' | 'oval';
  hairStyle: 'short' | 'long' | 'curly' | 'bald' | 'ponytail';
  hairColor: string;
  skinTone: string;
  eyeStyle: 'normal' | 'big' | 'sleepy' | 'glasses';
  expression: 'happy' | 'focused' | 'tired' | 'excited';
  accessory?: 'headphones' | 'hat' | 'bow' | 'none';
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  description: string;
}

export interface Secretary {
  id: string;
  name: string;
  type: 'business' | 'life' | 'personal';
  avatar: string;
  status: string;
}

export type ModalType = 'department' | 'employee' | 'skill' | 'market' | null;
