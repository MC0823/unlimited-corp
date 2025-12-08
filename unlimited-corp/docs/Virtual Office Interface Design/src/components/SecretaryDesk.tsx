import { motion } from 'motion/react';
import { MessageSquare, FileText, Calendar } from 'lucide-react';
import { Secretary } from '../types';

interface SecretaryDeskProps {
  secretaries: Secretary[];
}

export function SecretaryDesk({ secretaries }: SecretaryDeskProps) {
  const getSecretaryIcon = (type: string) => {
    switch (type) {
      case 'business':
        return <FileText className="w-4 h-4" />;
      case 'life':
        return <Calendar className="w-4 h-4" />;
      case 'personal':
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSecretaryColor = (type: string) => {
    switch (type) {
      case 'business':
        return '#3D7FFF';
      case 'life':
        return '#4ECDC4';
      case 'personal':
        return '#FF6B9D';
    }
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 接待台主体 */}
      <div 
        className="bg-gradient-to-br from-[#2a3f5f] to-[#1e2d42] rounded-2xl p-6 border-4 border-[#D4A574]/30 shadow-2xl relative overflow-hidden"
        style={{ width: '350px' }}
      >
        {/* 装饰性光效 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A574]/10 to-transparent pointer-events-none" />
        
        {/* 标题 */}
        <div className="relative z-10 mb-6">
          <h3 className="text-white flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👔
            </motion.span>
            秘书处
          </h3>
          <p className="text-xs text-white/60 mt-1">Executive Assistants</p>
        </div>

        {/* 三位秘书 */}
        <div className="relative z-10 space-y-4">
          {secretaries.map((secretary, index) => (
            <motion.div
              key={secretary.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.03, x: 5 }}
              className="cursor-pointer group"
            >
              <div 
                className="relative p-4 rounded-xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${getSecretaryColor(secretary.type)}22, ${getSecretaryColor(secretary.type)}11)`,
                  border: `2px solid ${getSecretaryColor(secretary.type)}33`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                {/* 悬停光效 */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${getSecretaryColor(secretary.type)}33, transparent)`,
                  }}
                />

                <div className="relative z-10 flex items-center gap-3">
                  {/* 秘书头像 */}
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 shadow-lg"
                    style={{ 
                      borderColor: getSecretaryColor(secretary.type),
                      backgroundColor: `${getSecretaryColor(secretary.type)}22`,
                    }}
                    animate={{
                      y: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2 + index * 0.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {secretary.avatar}
                  </motion.div>

                  {/* 秘书信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div style={{ color: getSecretaryColor(secretary.type) }}>
                        {getSecretaryIcon(secretary.type)}
                      </div>
                      <div className="text-sm text-white/90">{secretary.name}</div>
                    </div>
                    <div className="text-xs text-white/60 truncate">{secretary.status}</div>
                  </div>

                  {/* 状态指示灯 */}
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getSecretaryColor(secretary.type) }}
                    animate={{
                      opacity: [1, 0.5, 1],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                </div>

                {/* 互动提示 */}
                <motion.div
                  className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                >
                  <div 
                    className="text-xs text-white/80 whitespace-nowrap px-2 py-1 rounded"
                    style={{ backgroundColor: getSecretaryColor(secretary.type) }}
                  >
                    点击交互
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 桌面装饰 - 咖啡杯和文件 */}
        <motion.div
          className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-around"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            animate={{
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="text-2xl"
          >
            ☕
          </motion.div>
          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-2xl"
          >
            📋
          </motion.div>
          <motion.div
            animate={{
              rotate: [5, -5, 5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
            }}
            className="text-2xl"
          >
            📞
          </motion.div>
        </motion.div>

        {/* 装饰性粒子 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#D4A574] rounded-full"
            style={{
              left: `${30 + i * 20}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.7,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
