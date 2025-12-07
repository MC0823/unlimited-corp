import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Target, Flag, User } from 'lucide-react';
import { Task } from '../types';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return '#FF6B9D';
      case 'medium':
        return '#FFD93D';
      default:
        return '#4ECDC4';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return '#4ECDC4';
      case 'in-progress':
        return '#3D7FFF';
      default:
        return '#8B8B8B';
    }
  };

  const getStatusText = () => {
    switch (task.status) {
      case 'completed':
        return '已完成';
      case 'in-progress':
        return '进行中';
      default:
        return '待开始';
    }
  };

  const getPriorityText = () => {
    switch (task.priority) {
      case 'high':
        return '高优先级';
      case 'medium':
        return '中优先级';
      default:
        return '低优先级';
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
        {/* 背景遮罩 */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* 模态框主体 */}
        <motion.div
          className="relative bg-gradient-to-br from-[#2a3f5f] to-[#1e2d42] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
          style={{
            border: '4px solid',
            borderColor: getPriorityColor(),
          }}
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* 装饰性光效 */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${getPriorityColor()}88, transparent 70%)`,
            }}
          />

          {/* 顶部装饰条 */}
          <motion.div
            className="absolute top-0 inset-x-0 h-2"
            style={{ backgroundColor: getPriorityColor() }}
            animate={{
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {/* 关闭按钮 */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-6 right-6 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          {/* 内容区域 */}
          <div className="relative z-10 p-8 pt-10">
            {/* 标题区域 */}
            <div className="mb-6">
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${getPriorityColor()}, ${getPriorityColor()}cc)`,
                  }}
                  animate={{
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                >
                  📋
                </motion.div>
                <div className="flex-1">
                  <h2 className="text-white text-2xl mb-2">{task.title}</h2>
                  <p className="text-white/70">{task.description}</p>
                </div>
              </div>
            </div>

            {/* 任务属性网格 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* 状态 */}
              <motion.div
                className="p-4 rounded-xl bg-[#1a2332]/60 border-2 border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" style={{ color: getStatusColor() }} />
                  <span className="text-white/70 text-sm">任务状态</span>
                </div>
                <div 
                  className="text-xl text-white px-3 py-1 rounded-lg inline-block"
                  style={{ backgroundColor: `${getStatusColor()}22` }}
                >
                  {getStatusText()}
                </div>
              </motion.div>

              {/* 优先级 */}
              <motion.div
                className="p-4 rounded-xl bg-[#1a2332]/60 border-2 border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Flag className="w-5 h-5" style={{ color: getPriorityColor() }} />
                  <span className="text-white/70 text-sm">优先级</span>
                </div>
                <div 
                  className="text-xl text-white px-3 py-1 rounded-lg inline-block"
                  style={{ backgroundColor: `${getPriorityColor()}22` }}
                >
                  {getPriorityText()}
                </div>
              </motion.div>

              {/* 进度 */}
              <motion.div
                className="p-4 rounded-xl bg-[#1a2332]/60 border-2 border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#3D7FFF]" />
                  <span className="text-white/70 text-sm">完成进度</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-[#1a1a1a]/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${getPriorityColor()}, ${getPriorityColor()}aa)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xl text-white">{task.progress}%</span>
                </div>
              </motion.div>

              {/* 分配人员 */}
              <motion.div
                className="p-4 rounded-xl bg-[#1a2332]/60 border-2 border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-[#4ECDC4]" />
                  <span className="text-white/70 text-sm">负责人</span>
                </div>
                {task.assignee ? (
                  <div className="text-xl text-white">员工 #{task.assignee}</div>
                ) : (
                  <div className="text-xl text-white/50">未分配</div>
                )}
              </motion.div>
            </div>

            {/* 任务时间线 */}
            <div className="mb-6">
              <h3 className="text-white mb-3 flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  ⏱️
                </motion.div>
                任务时间线
              </h3>
              <div className="space-y-3">
                {[
                  { time: '2天前', event: '任务创建', status: 'done' },
                  { time: '1天前', event: '开始执行', status: task.status === 'pending' ? 'pending' : 'done' },
                  { time: '进行中', event: '执行中...', status: task.status === 'in-progress' ? 'current' : task.status === 'completed' ? 'done' : 'pending' },
                  { time: '预计明天', event: '预期完成', status: task.status === 'completed' ? 'done' : 'pending' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: item.status === 'done' ? '#4ECDC4' : item.status === 'current' ? getPriorityColor() : '#444',
                      }}
                      animate={item.status === 'current' ? {
                        scale: [1, 1.3, 1],
                        boxShadow: [`0 0 0 ${getPriorityColor()}`, `0 0 10px ${getPriorityColor()}`, `0 0 0 ${getPriorityColor()}`],
                      } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-white/90">{item.event}</span>
                      <span className="text-white/50 text-sm">{item.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 rounded-lg text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${getPriorityColor()}, ${getPriorityColor()}cc)`,
                }}
              >
                {task.status === 'completed' ? '查看详情' : '继续执行'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-[#1a2332] border-2 border-white/20 text-white shadow-lg hover:bg-[#1a2332]/80 transition-colors"
              >
                重新分配
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-[#FF6B9D]/20 border-2 border-[#FF6B9D]/40 text-[#FF6B9D] shadow-lg hover:bg-[#FF6B9D]/30 transition-colors"
              >
                删除
              </motion.button>
            </div>
          </div>

          {/* 装饰性扫描线 */}
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
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
      </motion.div>
    </AnimatePresence>
  );
}
