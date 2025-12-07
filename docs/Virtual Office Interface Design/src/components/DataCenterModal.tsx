import { motion, AnimatePresence } from 'motion/react';
import { X, BarChart3, TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DataCenterModalProps {
  onClose: () => void;
}

export function DataCenterModal({ onClose }: DataCenterModalProps) {
  const [revenue, setRevenue] = useState(12450);
  const [activeUsers, setActiveUsers] = useState(1847);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.floor(Math.random() * 100 - 20));
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10 - 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const screens = [
    { id: 1, title: '营收', value: `¥${revenue.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: '#4ECDC4', gradient: 'from-[#4ECDC4] to-[#44A08D]' },
    { id: 2, title: '活跃用户', value: activeUsers.toLocaleString(), change: '+8.3%', icon: Users, color: '#3D7FFF', gradient: 'from-[#3D7FFF] to-[#2a5fd4]' },
    { id: 3, title: '任务完成率', value: '78%', change: '+5.2%', icon: Target, color: '#FFD93D', gradient: 'from-[#FFD93D] to-[#F9A825]' },
    { id: 4, title: '团队效率', value: '92%', change: '+3.1%', icon: TrendingUp, color: '#FF6B9D', gradient: 'from-[#FF6B9D] to-[#E91E63]' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="relative bg-gradient-to-br from-[#1a2332] to-[#0f1419] rounded-2xl shadow-2xl max-w-4xl w-full border-4 border-[#4ECDC4]/40"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
        >
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-8 h-8 text-[#4ECDC4]" />
              <h2 className="text-white text-2xl">实时数据中心</h2>
              <div className="ml-auto text-xs text-[#4ECDC4] animate-pulse">● LIVE</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {screens.map((screen, index) => {
                const Icon = screen.icon;
                return (
                  <motion.div
                    key={screen.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="cursor-pointer p-6 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #2a3f5f 0%, #1e2d42 100%)',
                      border: `2px solid ${screen.color}44`,
                    }}
                  >
                    <motion.div
                      className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${screen.color}44, ${screen.color}22)` }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon className="w-6 h-6" style={{ color: screen.color }} />
                    </motion.div>

                    <div className="text-sm text-white/60 mb-2">{screen.title}</div>
                    <motion.div
                      className="text-2xl text-white mb-2"
                      key={screen.value}
                      initial={{ scale: 1.2, color: screen.color }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                    >
                      {screen.value}
                    </motion.div>

                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" style={{ color: screen.color }} />
                      <span className="text-sm" style={{ color: screen.color }}>{screen.change}</span>
                    </div>

                    <div className="mt-3 h-2 bg-[#0a0a0a]/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${screen.gradient} rounded-full`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, delay: index * 0.2 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
