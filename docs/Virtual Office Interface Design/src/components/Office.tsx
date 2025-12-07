import { useState } from 'react';
import { motion } from 'motion/react';
import { EmployeeWorkstation } from './EmployeeWorkstation';
import { TopBar } from './TopBar';
import { BottomButtonBar } from './BottomButtonBar';
import { Employee, Task, Secretary } from '../types';

interface OfficeProps {
  onEmployeeClick: (employee: Employee) => void;
  onTaskClick: (task: Task) => void;
  onCommandClick: () => void;
  onModalOpen: (modal: 'tasks' | 'secretary' | 'data' | 'market') => void;
}

export function Office({ onEmployeeClick, onTaskClick, onCommandClick, onModalOpen }: OfficeProps) {
  // 模拟员工数据
  const [employees] = useState<Employee[]>([
    { id: '1', name: 'Alice Chen', role: 'developer', status: 'working', skills: ['React', 'TypeScript'], performance: 92, currentTask: 'task-1', avatarColor: '#FF6B9D', position: { x: 25, y: 40 } },
    { id: '2', name: 'Bob Liu', role: 'designer', status: 'idle', skills: ['UI/UX', 'Figma'], performance: 88, avatarColor: '#4ECDC4', position: { x: 40, y: 40 } },
    { id: '3', name: 'Carol Wang', role: 'marketer', status: 'working', skills: ['SEO', 'Content'], performance: 85, currentTask: 'task-2', avatarColor: '#FFD93D', position: { x: 55, y: 40 } },
    { id: '4', name: 'David Zhang', role: 'analyst', status: 'tired', skills: ['Data', 'SQL'], performance: 90, avatarColor: '#A8E6CF', position: { x: 70, y: 40 } },
    { id: '5', name: 'Emma Li', role: 'developer', status: 'working', skills: ['Python', 'AI'], performance: 94, currentTask: 'task-3', avatarColor: '#C7CEEA', position: { x: 25, y: 55 } },
    { id: '6', name: 'Frank Wu', role: 'designer', status: 'idle', skills: ['Branding', 'Animation'], performance: 87, avatarColor: '#FFDAB9', position: { x: 40, y: 55 } },
  ]);

  // 模拟任务数据
  const [tasks] = useState<Task[]>([
    { id: 'task-1', title: '开发新功能模块', status: 'in-progress', assignee: '1', priority: 'high', progress: 65, description: '实现用户管理系统的核心功能' },
    { id: 'task-2', title: '市场推广方案', status: 'in-progress', assignee: '3', priority: 'medium', progress: 40, description: '制定Q4季度营销策略' },
    { id: 'task-3', title: 'AI模型优化', status: 'in-progress', assignee: '5', priority: 'high', progress: 78, description: '提升模型准确率到95%以上' },
    { id: 'task-4', title: '界面设计优化', status: 'pending', priority: 'low', progress: 0, description: '重新设计产品主页面' },
    { id: 'task-5', title: '数据分析报告', status: 'completed', priority: 'medium', progress: 100, description: '生成月度运营数据报告' },
  ]);

  // 模拟秘书数据
  const [secretaries] = useState<Secretary[]>([
    { id: 's1', name: '商务秘书 Linda', type: 'business', avatar: '📊', status: '已准备3份报告' },
    { id: 's2', name: '生活秘书 Sophia', type: 'life', avatar: '☕', status: '今日行程已安排' },
    { id: 's3', name: '私人秘书 Grace', type: 'personal', avatar: '🎧', status: '待处理消息 5 条' },
  ]);

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* 网格背景 - 增强等距感 */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(45deg, #3D7FFF 1px, transparent 1px),
          linear-gradient(-45deg, #3D7FFF 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* 顶部状态栏 */}
      <TopBar />

      {/* 中央场景区域 - 员工办公区 */}
      <div className="flex-1 relative flex items-center justify-center overflow-auto">
        <motion.div
          className="w-full max-w-6xl px-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-[#1e2936]/50 rounded-2xl p-8 border-2 border-[#3D7FFF]/30 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#4ECDC4] animate-pulse" />
              <h2 className="text-white/90">员工工作区 Employee Workspace</h2>
            </div>
            <div className="grid grid-cols-3 gap-8">
              {employees.map((employee, index) => (
                <EmployeeWorkstation
                  key={employee.id}
                  employee={employee}
                  onClick={() => onEmployeeClick(employee)}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* 装饰性元素 - 飘动的粒子 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#3D7FFF]/30 rounded-full pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 底部按钮栏 */}
      <BottomButtonBar 
        onCommandClick={onCommandClick}
        tasks={tasks}
        secretaries={secretaries}
        onModalOpen={onModalOpen}
      />
    </div>
  );
}