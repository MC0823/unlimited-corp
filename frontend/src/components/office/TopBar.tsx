import { motion } from 'framer-motion';
import { DollarSign, Users, Target, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export function TopBar() {
  const [revenue, setRevenue] = useState(12450);
  const [activeUsers, setActiveUsers] = useState(1847);
  const taskCompletion = 78;
  const efficiency = 92;

  // 模拟数据动态更新
  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue(prev => prev + Math.floor(Math.random() * 100 - 20));
      setActiveUsers(prev => prev + Math.floor(Math.random() * 10 - 5));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: DollarSign, label: '营收', value: `¥${revenue.toLocaleString()}`, color: '#4ECDC4' },
    { icon: Users, label: '活跃用户', value: activeUsers.toLocaleString(), color: '#3D7FFF' },
    { icon: Target, label: '任务完成率', value: `${taskCompletion}%`, color: '#FFD93D' },
    { icon: TrendingUp, label: '团队效率', value: `${efficiency}%`, color: '#FF6B9D' },
  ];

  return (
    <motion.div
      className="relative z-20 bg-gradient-to-b from-[#1a2332] to-transparent backdrop-blur-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo 和标题 */}
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3D7FFF] to-[#2a5fd4] flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div>
              <h1 className="text-white tracking-wider">无限公司 INFINITE CORP</h1>
              <p className="text-xs text-white/60">CEO 智能管理中枢</p>
            </div>
          </motion.div>

          {/* 实时数据统计 */}
          <div className="flex items-center gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0f1419]/50 border border-white/10"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, borderColor: stat.color }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}22` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                    <motion.div
                      className="text-white"
                      key={stat.value}
                      initial={{ scale: 1.2, color: stat.color }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                    >
                      {stat.value}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 状态指示 */}
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f1419]/50 border border-[#4ECDC4]/30"
            animate={{
              borderColor: ['rgba(78, 205, 196, 0.3)', 'rgba(78, 205, 196, 0.6)', 'rgba(78, 205, 196, 0.3)'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-[#4ECDC4]"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
            <span className="text-xs text-[#4ECDC4]">系统运行中</span>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
