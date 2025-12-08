import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useState } from 'react';

interface TaskBoardModalProps {
  onClose: () => void;
}

export function TaskBoardModal({ onClose }: TaskBoardModalProps) {
  const [tasks] = useState([
    { id: 'task-1', title: '开发新功能模块', status: 'in-progress', assignee: '1', priority: 'high', progress: 65, description: '实现用户管理系统的核心功能' },
    { id: 'task-2', title: '市场推广方案', status: 'in-progress', assignee: '3', priority: 'medium', progress: 40, description: '制定Q4季度营销策略' },
    { id: 'task-3', title: 'AI模型优化', status: 'in-progress', assignee: '5', priority: 'high', progress: 78, description: '提升模型准确率到95%以上' },
    { id: 'task-4', title: '界面设计优化', status: 'pending', priority: 'low', progress: 0, description: '重新设计产品主页面' },
    { id: 'task-5', title: '数据分析报告', status: 'completed', priority: 'medium', progress: 100, description: '生成月度运营数据报告' },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B9D';
      case 'medium': return '#FFD93D';
      default: return '#4ECDC4';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          className="relative rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 95, 0.9) 0%, rgba(30, 45, 66, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 60px rgba(255, 217, 61, 0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* 顶部彩色边框 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD93D] to-transparent" />
          
          {/* 玻璃态光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
          
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 border border-white/10 office-btn"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          <div className="p-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#FFD93D]/20 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-[#FFD93D]" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold">任务调度中心</h2>
                <p className="text-white/50 text-sm">管理和跟踪团队任务</p>
              </div>
              <div className="ml-auto bg-[#FFD93D]/20 px-4 py-2 rounded-xl border border-[#FFD93D]/30">
                <span className="text-sm text-[#FFD93D] font-medium">{tasks.length} 个任务</span>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 office-scrollbar">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="p-4 rounded-xl border-l-4 cursor-pointer backdrop-blur-sm"
                  style={{
                    backgroundColor: task.status === 'completed' ? 'rgba(26, 58, 46, 0.6)' : 'rgba(42, 63, 95, 0.6)',
                    borderLeftColor: getPriorityColor(task.priority),
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderLeftWidth: '4px',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div style={{ color: getPriorityColor(task.priority) }}>
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="text-white/90">{task.title}</div>
                    </div>
                  </div>

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
                        />
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-white/60">{task.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
