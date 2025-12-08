import { motion } from 'motion/react';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DataScreens() {
  const [revenue, setRevenue] = useState(12450);
  const [activeUsers, setActiveUsers] = useState(1847);
  const [taskCompletion, setTaskCompletion] = useState(78);
  const [efficiency, setEfficiency] = useState(92);

  // 模拟数据动态更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.floor(Math.random() * 100 - 20));
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10 - 5));
      setTaskCompletion(prev => Math.min(100, prev + Math.floor(Math.random() * 3)));
      setEfficiency(prev => Math.min(100, Math.max(70, prev + Math.floor(Math.random() * 5 - 2))));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const screens = [
    {
      id: 1,
      title: '营收',
      value: `¥${revenue.toLocaleString()}`,
      change: '+12.5%',
      icon: DollarSign,
      color: '#4ECDC4',
      gradient: 'from-[#4ECDC4] to-[#44A08D]',
    },
    {
      id: 2,
      title: '活跃用户',
      value: activeUsers.toLocaleString(),
      change: '+8.3%',
      icon: Users,
      color: '#3D7FFF',
      gradient: 'from-[#3D7FFF] to-[#2a5fd4]',
    },
    {
      id: 3,
      title: '任务完成率',
      value: `${taskCompletion}%`,
      change: '+5.2%',
      icon: Target,
      color: '#FFD93D',
      gradient: 'from-[#FFD93D] to-[#F9A825]',
    },
    {
      id: 4,
      title: '团队效率',
      value: `${efficiency}%`,
      change: '+3.1%',
      icon: TrendingUp,
      color: '#FF6B9D',
      gradient: 'from-[#FF6B9D] to-[#E91E63]',
    },
  ];

  return (
    <div className="relative">
      {/* 数据墙主体 */}
      <div className="bg-gradient-to-br from-[#1a2332] to-[#0f1419] rounded-2xl p-6 border-4 border-[#3D7FFF]/30 shadow-2xl relative overflow-hidden"
        style={{ width: '480px' }}
      >
        {/* 扫描线效果 */}
        <motion.div
          className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#3D7FFF] to-transparent"
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* 标题 */}
        <div className="relative z-10 mb-6 flex items-center gap-3">
          <motion.div
            className="w-3 h-3 rounded-full bg-[#4ECDC4]"
            animate={{
              opacity: [1, 0.5, 1],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <h3 className="text-white">实时数据中心</h3>
          <div className="ml-auto text-xs text-[#4ECDC4] animate-pulse">● LIVE</div>
        </div>

        {/* 屏幕网格 */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {screens.map((screen, index) => {
            const Icon = screen.icon;
            
            return (
              <motion.div
                key={screen.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="cursor-pointer group"
              >
                {/* 屏幕显示器 */}
                <div className="relative p-4 rounded-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #2a3f5f 0%, #1e2d42 100%)',
                    boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px ${screen.color}22`,
                    border: `2px solid ${screen.color}44`,
                  }}
                >
                  {/* 屏幕发光效果 */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${screen.color}44, transparent)`,
                    }}
                  />

                  {/* CRT 扫描线纹理 */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
                    }}
                  />

                  <div className="relative z-10">
                    {/* 图标 */}
                    <motion.div
                      className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${screen.color}44, ${screen.color}22)`,
                      }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-5 h-5" style={{ color: screen.color }} />
                    </motion.div>

                    {/* 标题 */}
                    <div className="text-xs text-white/60 mb-2">{screen.title}</div>

                    {/* 数值 */}
                    <motion.div
                      className="text-xl text-white mb-2"
                      key={screen.value}
                      initial={{ scale: 1.2, color: screen.color }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                    >
                      {screen.value}
                    </motion.div>

                    {/* 变化趋势 */}
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" style={{ color: screen.color }} />
                      <span className="text-xs" style={{ color: screen.color }}>
                        {screen.change}
                      </span>
                    </div>

                    {/* 进度条装饰 */}
                    <div className="mt-3 h-1 bg-[#0a0a0a]/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${screen.gradient} rounded-full`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{
                          duration: 2,
                          delay: index * 0.2,
                          ease: 'easeOut',
                        }}
                      />
                    </div>
                  </div>

                  {/* 屏幕边框高光 */}
                  <div className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      boxShadow: `inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1px 1px rgba(0,0,0,0.3)`,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 底部状态栏 */}
        <motion.div
          className="relative z-10 mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-[#4ECDC4] rounded-full"
              animate={{
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <span>系统运行正常</span>
          </div>
          <div>最后更新: {new Date().toLocaleTimeString('zh-CN')}</div>
        </motion.div>

        {/* 装饰性数据流 */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-8 bg-gradient-to-b from-[#3D7FFF] to-transparent"
            style={{
              left: `${15 + i * 15}%`,
              top: '-32px',
            }}
            animate={{
              top: ['0%', '110%'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  );
}
