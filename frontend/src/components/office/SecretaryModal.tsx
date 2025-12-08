import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageSquare, FileText, Calendar, LucideIcon } from 'lucide-react';

interface SecretaryModalProps {
  onClose: () => void;
}

export function SecretaryModal({ onClose }: SecretaryModalProps) {
  const secretaries: Array<{
    id: string;
    name: string;
    type: string;
    avatar: string;
    status: string;
    color: string;
    icon: LucideIcon;
  }> = [
    { id: 's1', name: '商务秘书 Linda', type: 'business', avatar: '📊', status: '已准备3份报告', color: '#3D7FFF', icon: FileText },
    { id: 's2', name: '生活秘书 Sophia', type: 'life', avatar: '☕', status: '今日行程已安排', color: '#4ECDC4', icon: Calendar },
    { id: 's3', name: '私人秘书 Grace', type: 'personal', avatar: '🎧', status: '待处理消息 5 条', color: '#FF6B9D', icon: MessageSquare },
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
          className="relative rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 95, 0.9) 0%, rgba(30, 45, 66, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 60px rgba(255, 107, 157, 0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* 顶部彩色边框 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B9D] to-transparent" />
          
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
              <div className="w-12 h-12 rounded-xl bg-[#FF6B9D]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#FF6B9D]" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold">秘书处</h2>
                <p className="text-white/50 text-sm">您的专属助理团队</p>
              </div>
            </div>

            <div className="space-y-4">
              {secretaries.map((secretary, index) => {
                const Icon = secretary.icon;
                return (
                  <motion.div
                    key={secretary.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    whileHover={{ scale: 1.03, x: 5 }}
                    className="cursor-pointer p-6 rounded-xl overflow-hidden backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${secretary.color}15, ${secretary.color}08)`,
                      border: `1px solid ${secretary.color}33`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2 shadow-lg"
                        style={{
                          borderColor: secretary.color,
                          backgroundColor: `${secretary.color}22`,
                        }}
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2 + index * 0.5, repeat: Infinity }}
                      >
                        {secretary.avatar}
                      </motion.div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-5 h-5" style={{ color: secretary.color }} />
                          <div className="text-lg text-white/90">{secretary.name}</div>
                        </div>
                        <div className="text-sm text-white/60">{secretary.status}</div>
                      </div>

                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: secretary.color }}
                        animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
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
