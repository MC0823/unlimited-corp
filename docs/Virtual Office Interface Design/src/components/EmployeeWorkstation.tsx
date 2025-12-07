import { motion } from 'motion/react';
import { User, Zap, Coffee, Brain } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeWorkstationProps {
  employee: Employee;
  onClick: () => void;
  delay?: number;
}

export function EmployeeWorkstation({ employee, onClick, delay = 0 }: EmployeeWorkstationProps) {
  const getStatusIcon = () => {
    switch (employee.status) {
      case 'working':
        return <Zap className="w-3 h-3 text-[#FFD93D]" />;
      case 'tired':
        return <Coffee className="w-3 h-3 text-[#FF6B9D]" />;
      default:
        return <Brain className="w-3 h-3 text-[#4ECDC4]" />;
    }
  };

  const getStatusColor = () => {
    switch (employee.status) {
      case 'working':
        return '#FFD93D';
      case 'tired':
        return '#FF6B9D';
      default:
        return '#4ECDC4';
    }
  };

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
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className="relative cursor-pointer group"
    >
      {/* 工位底座 - 等距视角 */}
      <div className="relative">
        {/* 桌子 */}
        <div 
          className="w-full h-20 rounded-lg relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, #2a3f5f 0%, #1e2d42 100%)`,
            transform: 'perspective(200px) rotateX(20deg)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}
        >
          {/* 桌面光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          
          {/* 键盘装饰 */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-[#1a1a1a]/50 rounded-sm border border-white/10" />
        </div>

        {/* 员工角色 - Q版人物 */}
        <motion.div
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-10"
          animate={employee.status === 'tired' ? {
            rotate: [-2, 2, -2],
          } : employee.status === 'working' ? {
            y: [0, -2, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* 角色圆形头像 */}
          <div 
            className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center relative shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${employee.avatarColor}, ${employee.avatarColor}dd)`,
            }}
          >
            <div className="text-2xl">{getRoleIcon()}</div>
            
            {/* 状态指示器 */}
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1e2936] flex items-center justify-center"
              style={{ backgroundColor: getStatusColor() }}
              animate={employee.status === 'idle' ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {getStatusIcon()}
            </motion.div>
          </div>

          {/* 思考气泡 - 工作中显示 */}
          {employee.status === 'working' && employee.currentTask && (
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white/90 rounded-full px-3 py-1 text-xs backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D7FFF] animate-pulse" />
                <span className="text-gray-700">工作中...</span>
              </div>
              {/* 气泡尾巴 */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 rotate-45" />
            </motion.div>
          )}

          {/* 疲惫状态 - Z字符 */}
          {employee.status === 'tired' && (
            <motion.div
              className="absolute -right-8 -top-4 text-2xl"
              animate={{
                opacity: [0, 1, 0],
                y: [0, -10, -20],
                x: [0, 5, 10],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              💤
            </motion.div>
          )}
        </motion.div>

        {/* 名称标签 */}
        <div className="mt-2 text-center">
          <div className="text-xs text-white/90">{employee.name}</div>
          <div className="text-xs text-white/50 mt-0.5">{employee.performance}%</div>
        </div>

        {/* 进度条 - 工作中显示 */}
        {employee.status === 'working' && (
          <motion.div
            className="mt-2 h-1 bg-[#1e2936] rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}aa)`,
              }}
              animate={{
                width: ['0%', '100%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </motion.div>
        )}

        {/* 悬停发光效果 */}
        <div 
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${getStatusColor()}`,
          }}
        />
      </div>
    </motion.div>
  );
}
