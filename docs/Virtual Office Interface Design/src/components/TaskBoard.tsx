import { motion } from 'motion/react';
import { ClipboardList, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Task, Employee } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  employees: Employee[];
}

export function TaskBoard({ tasks, onTaskClick, employees }: TaskBoardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF6B9D';
      case 'medium':
        return '#FFD93D';
      default:
        return '#4ECDC4';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // 找到被分配任务的员工，用于绘制连接线
  const getAssignedEmployee = (assigneeId?: string) => {
    return employees.find(emp => emp.id === assigneeId);
  };

  return (
    <div className="relative">
      {/* 看板墙面 */}
      <motion.div
        className="bg-[#1e2936] rounded-2xl p-6 border-4 border-[#D4A574]/40 shadow-2xl relative overflow-hidden"
        style={{
          width: '380px',
          minHeight: '450px',
          background: 'linear-gradient(135deg, #2a3f5f 0%, #1e2d42 100%)',
        }}
        initial={{ opacity: 0, rotateY: -20 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 发光边框效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3D7FFF]/20 to-transparent pointer-events-none" />
        
        {/* 标题栏 */}
        <div className="relative z-10 flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <ClipboardList className="w-6 h-6 text-[#D4A574]" />
          </motion.div>
          <h2 className="text-white">任务调度看板</h2>
          <div className="ml-auto bg-[#3D7FFF]/20 px-3 py-1 rounded-full">
            <span className="text-xs text-[#4ECDC4]">{tasks.length} 个任务</span>
          </div>
        </div>

        {/* 任务卡片列表 */}
        <div className="relative z-10 space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#3D7FFF]/50 scrollbar-track-transparent">
          {tasks.map((task, index) => {
            const assignedEmployee = getAssignedEmployee(task.assignee);
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => onTaskClick(task)}
                className="relative cursor-pointer group"
              >
                {/* 任务卡片 - 便利贴风格 */}
                <div 
                  className="p-4 rounded-lg relative overflow-hidden shadow-lg border-l-4"
                  style={{
                    backgroundColor: task.status === 'completed' ? '#1a3a2e' : '#2a3f5f',
                    borderLeftColor: getPriorityColor(task.priority),
                    boxShadow: `0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                >
                  {/* 卡片光效 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* 内容 */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <div style={{ color: getPriorityColor(task.priority) }}>
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="text-sm text-white/90 line-clamp-1">{task.title}</div>
                      </div>
                    </div>

                    {/* 进度条 */}
                    {task.status === 'in-progress' && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                          <span>进度</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-[#1a1a1a]/50 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ 
                              background: `linear-gradient(90deg, ${getPriorityColor(task.priority)}, ${getPriorityColor(task.priority)}aa)`,
                              width: `${task.progress}%`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 分配信息 */}
                    {assignedEmployee && (
                      <div className="flex items-center gap-2 mt-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-white/20"
                          style={{ backgroundColor: assignedEmployee.avatarColor }}
                        >
                          {assignedEmployee.name[0]}
                        </div>
                        <span className="text-xs text-white/70">{assignedEmployee.name}</span>
                      </div>
                    )}

                    {/* 未分配标记 */}
                    {!task.assignee && task.status === 'pending' && (
                      <div className="mt-2">
                        <span className="text-xs text-[#FFD93D]">⚠ 待分配</span>
                      </div>
                    )}
                  </div>

                  {/* 优先级标签 */}
                  <div 
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                </div>

                {/* 连接线效果 - 指向分配的员工 */}
                {assignedEmployee && task.status === 'in-progress' && (
                  <motion.div
                    className="absolute top-1/2 -right-8 w-8 h-0.5"
                    style={{
                      background: `linear-gradient(90deg, ${getPriorityColor(task.priority)}88, transparent)`,
                    }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    {/* 箭头 */}
                    <div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-r-2 border-t-2"
                      style={{ borderColor: getPriorityColor(task.priority) }}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 底部统计栏 */}
        <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF6B9D]" />
            <span className="text-white/70">{tasks.filter(t => t.priority === 'high').length} 高</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FFD93D]" />
            <span className="text-white/70">{tasks.filter(t => t.status === 'in-progress').length} 进行中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
            <span className="text-white/70">{tasks.filter(t => t.status === 'completed').length} 完成</span>
          </div>
        </div>

        {/* 装饰性扫描线 */}
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#3D7FFF]/50 to-transparent"
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  );
}
