import { motion, AnimatePresence } from 'framer-motion';
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
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          className="relative rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(15, 20, 25, 0.98) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 80px rgba(78, 205, 196, 0.2), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* 顶部彩色边框 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#4ECDC4] to-transparent" />
          
          {/* 玻璃态光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
          
          {/* 动态网格背景 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(#4ECDC4 1px, transparent 1px), linear-gradient(90deg, #4ECDC4 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 border border-white/10 office-btn"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          <div className="p-8 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#4ECDC4]/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[#4ECDC4]" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold">实时数据中心</h2>
                <p className="text-white/50 text-sm">企业运营数据总览</p>
              </div>
              <motion.div 
                className="ml-auto flex items-center gap-2 bg-[#4ECDC4]/20 px-4 py-2 rounded-xl border border-[#4ECDC4]/30"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
                <span className="text-sm text-[#4ECDC4] font-medium">LIVE</span>
              </motion.div>
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
                    className="cursor-pointer p-6 rounded-xl backdrop-blur-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(42, 63, 95, 0.6) 0%, rgba(30, 45, 66, 0.4) 100%)',
                      border: `1px solid ${screen.color}33`,
                      boxShadow: `0 4px 20px ${screen.color}11`,
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
                      className="text-2xl text-white mb-2 font-medium"
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
