import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, TrendingUp, Award, Briefcase } from 'lucide-react';
import { Employee } from '../../types/office';

interface EmployeeDetailModalProps {
  employee: Employee;
  onClose: () => void;
}

export function EmployeeDetailModal({ employee, onClose }: EmployeeDetailModalProps) {
  const getRoleIcon = () => {
    switch (employee.role) {
      case 'developer':
        return '💻';
      case 'designer':
        return '🎨';
      case 'marketer':
        return '📢';
      case 'analyst':
        return '📊';
      default:
        return '👤';
    }
  };

  const getRoleText = () => {
    switch (employee.role) {
      case 'developer':
        return '开发工程师';
      case 'designer':
        return '设计师';
      case 'marketer':
        return '市场专员';
      case 'analyst':
        return '数据分析师';
      default:
        return '员工';
    }
  };

  const getStatusText = () => {
    switch (employee.status) {
      case 'working':
        return '工作中';
      case 'tired':
        return '疲惫';
      default:
        return '空闲';
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
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* 模态框主体 */}
        <motion.div
          className="relative rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 95, 0.9) 0%, rgba(30, 45, 66, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `0 0 60px ${employee.avatarColor}33, 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* 顶部彩色边框 */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${employee.avatarColor}, transparent)`,
            }}
          />
          
          {/* 玻璃态光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
          {/* 装饰性光效 */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 20% 10%, ${employee.avatarColor}33, transparent 50%)`,
            }}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* 边缘发光 */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: `inset 0 0 30px ${employee.avatarColor}22`,
            }}
          />

          {/* 关闭按钮 */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 office-btn"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          {/* 内容区域 */}
          <div className="relative z-10 p-8">
            {/* 头部 - 员工信息 */}
            <div className="flex items-start gap-6 mb-6">
              {/* 头像 */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="w-24 h-24 rounded-2xl border-4 border-white/20 flex items-center justify-center text-5xl shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${employee.avatarColor}, ${employee.avatarColor}cc)`,
                  }}
                >
                  {getRoleIcon()}
                </div>
                {/* 状态徽章 */}
                <motion.div
                  className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs text-white shadow-lg"
                  style={{ backgroundColor: employee.avatarColor }}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {getStatusText()}
                </motion.div>
              </motion.div>

              {/* 基本信息 */}
              <div className="flex-1">
                <h2 className="text-white text-2xl mb-2 font-medium">{employee.name}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-[#D4A574]" />
                  <span className="text-white/80">{getRoleText()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-[#FFD93D]" />
                    <span className="text-white/70 text-sm">绩效评分</span>
                  </div>
                  <div className="flex-1 h-2 bg-[#1a1a1a]/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${employee.avatarColor}, ${employee.avatarColor}aa)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${employee.performance}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-white font-medium">{employee.performance}%</span>
                </div>
              </div>
            </div>

            {/* 技能列表 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-[#4ECDC4]" />
                <h3 className="text-white font-medium">技能专长</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className="px-4 py-2 rounded-lg bg-[#3D7FFF]/20 border border-[#3D7FFF]/40 text-white/90 text-sm"
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 当前任务 */}
            {employee.currentTask && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#FFD93D]" />
                  <h3 className="text-white font-medium">当前任务</h3>
                </div>
                <div className="p-4 rounded-lg bg-[#1a2332]/60 border border-[#FFD93D]/30">
                  <div className="text-white/90">正在处理任务 #{employee.currentTask}</div>
                  <motion.div
                    className="mt-2 h-1 bg-[#1a1a1a]/50 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#FFD93D] to-[#F9A825] rounded-full"
                      animate={{
                        width: ['0%', '100%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 rounded-lg text-white shadow-lg font-medium"
                style={{
                  background: `linear-gradient(135deg, ${employee.avatarColor}, ${employee.avatarColor}cc)`,
                }}
              >
                分配新任务
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 rounded-lg bg-[#1a2332] border-2 border-white/20 text-white shadow-lg hover:bg-[#1a2332]/80 transition-colors font-medium"
              >
                调整技能
              </motion.button>
            </div>
          </div>

          {/* 底部装饰线 */}
          <motion.div
            className="absolute bottom-0 inset-x-0 h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${employee.avatarColor}, transparent)`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
