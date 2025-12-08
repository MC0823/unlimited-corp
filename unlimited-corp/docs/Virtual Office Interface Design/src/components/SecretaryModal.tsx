import { motion, AnimatePresence } from 'motion/react';
import { X, Users, MessageSquare, FileText, Calendar } from 'lucide-react';

interface SecretaryModalProps {
  onClose: () => void;
}

export function SecretaryModal({ onClose }: SecretaryModalProps) {
  const secretaries = [
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
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="relative bg-gradient-to-br from-[#2a3f5f] to-[#1e2d42] rounded-2xl shadow-2xl max-w-2xl w-full border-4 border-[#FF6B9D]/40"
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
              <Users className="w-8 h-8 text-[#FF6B9D]" />
              <h2 className="text-white text-2xl">秘书处</h2>
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
                    className="cursor-pointer p-6 rounded-xl overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${secretary.color}22, ${secretary.color}11)`,
                      border: `2px solid ${secretary.color}33`,
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
