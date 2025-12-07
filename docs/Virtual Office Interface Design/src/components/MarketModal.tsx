import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Star, Zap } from 'lucide-react';

interface MarketModalProps {
  onClose: () => void;
}

export function MarketModal({ onClose }: MarketModalProps) {
  const services = [
    { id: 1, name: 'UI设计服务', icon: '🎨', price: '¥500/天', rating: 4.8, description: '专业UI/UX设计师，精通Figma和Sketch' },
    { id: 2, name: 'AI算法外包', icon: '🤖', price: '¥1200/天', rating: 4.9, description: '深度学习专家，擅长模型优化' },
    { id: 3, name: '内容营销', icon: '📝', price: '¥800/天', rating: 4.7, description: '资深营销策划，SEO和内容创作' },
    { id: 4, name: '数据分析', icon: '📊', price: '¥600/天', rating: 4.6, description: '数据科学家，精通Python和SQL' },
  ];

  const skills = [
    { id: 1, name: 'React Master', icon: '⚛️', level: 'Epic', color: '#FF6B9D', description: '精通React生态系统' },
    { id: 2, name: 'AI Wizard', icon: '🧙', level: 'Rare', color: '#3D7FFF', description: '人工智能专家技能包' },
    { id: 3, name: 'Design Pro', icon: '✨', level: 'Common', color: '#FFD93D', description: '设计大师技能组合' },
    { id: 4, name: 'Marketing Ace', icon: '🎯', level: 'Rare', color: '#4ECDC4', description: '营销专家技能卡' },
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
          className="relative bg-gradient-to-br from-[#2a3f5f] to-[#1e2d42] rounded-2xl shadow-2xl max-w-5xl w-full border-4 border-[#A8E6CF]/40"
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
              <ShoppingBag className="w-8 h-8 text-[#4ECDC4]" />
              <h2 className="text-white text-2xl">市场广场</h2>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* 外包服务 */}
              <div>
                <h3 className="text-white/90 mb-4">外包服务</h3>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, x: 5 }}
                      className="cursor-pointer bg-[#1a2332]/80 p-4 rounded-lg border border-[#4ECDC4]/20 hover:border-[#4ECDC4]/50"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl">{service.icon}</span>
                        <div className="flex-1">
                          <div className="text-white/90 mb-1">{service.name}</div>
                          <p className="text-xs text-white/60">{service.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#4ECDC4]">{service.price}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#FFD93D] fill-[#FFD93D]" />
                          <span className="text-white/70">{service.rating}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 技能卡 */}
              <div>
                <h3 className="text-white/90 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#FFD93D]" />
                  技能装配
                </h3>
                <div className="space-y-3">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, rotateY: -90 }}
                      animate={{ opacity: 1, rotateY: 0 }}
                      transition={{ delay: index * 0.15 }}
                      whileHover={{ scale: 1.05, rotateZ: 5 }}
                      drag
                      dragElastic={0.7}
                      className="cursor-grab active:cursor-grabbing p-4 rounded-lg relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${skill.color}44, ${skill.color}22)`,
                        border: `2px solid ${skill.color}66`,
                      }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, transparent, ${skill.color}44, transparent)` }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{skill.icon}</span>
                          <div className="flex-1">
                            <div className="text-white/90 mb-1">{skill.name}</div>
                            <p className="text-xs text-white/60">{skill.description}</p>
                          </div>
                        </div>
                        <div
                          className="text-xs px-2 py-1 rounded-full inline-block"
                          style={{
                            backgroundColor: `${skill.color}33`,
                            color: skill.color,
                          }}
                        >
                          {skill.level}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
