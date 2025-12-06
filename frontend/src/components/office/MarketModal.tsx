import { motion, AnimatePresence } from 'framer-motion';
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
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          className="relative rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 95, 0.9) 0%, rgba(30, 45, 66, 0.95) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 60px rgba(168, 230, 207, 0.15), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* 顶部彩色边框 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#A8E6CF] to-transparent" />
          
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
              <div className="w-12 h-12 rounded-xl bg-[#4ECDC4]/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-[#4ECDC4]" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold">市场广场</h2>
                <p className="text-white/50 text-sm">发现优质服务和技能卡</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* 外包服务 */}
              <div>
                <h3 className="text-white/90 mb-4 font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4ECDC4]" />
                  外包服务
                </h3>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, x: 5 }}
                      className="cursor-pointer bg-[#1a2332]/60 p-4 rounded-xl border border-[#4ECDC4]/20 hover:border-[#4ECDC4]/50 backdrop-blur-sm transition-colors"
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
                <h3 className="text-white/90 mb-4 flex items-center gap-2 font-semibold">
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
                      whileHover={{ scale: 1.05, rotateZ: 2 }}
                      drag
                      dragElastic={0.7}
                      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                      className="cursor-grab active:cursor-grabbing p-4 rounded-xl relative overflow-hidden backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${skill.color}22, ${skill.color}11)`,
                        border: `1px solid ${skill.color}44`,
                        boxShadow: `0 4px 20px ${skill.color}11`,
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
