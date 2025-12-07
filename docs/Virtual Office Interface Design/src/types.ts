export type EmployeeStatus = 'idle' | 'working' | 'tired';
export type EmployeeRole = 'developer' | 'designer' | 'marketer' | 'analyst';

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
