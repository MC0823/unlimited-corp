import { motion } from 'motion/react';
import { Briefcase, ShoppingBag, Zap, Star } from 'lucide-react';

export function MarketCorner() {
  const services = [
    { id: 1, name: 'UI设计服务', icon: '🎨', price: '¥500/天', rating: 4.8 },
    { id: 2, name: 'AI算法外包', icon: '🤖', price: '¥1200/天', rating: 4.9 },
    { id: 3, name: '内容营销', icon: '📝', price: '¥800/天', rating: 4.7 },
  ];

  const skills = [
    { id: 1, name: 'React Master', icon: '⚛️', level: 'Epic', color: '#FF6B9D' },
    { id: 2, name: 'AI Wizard', icon: '🧙', level: 'Rare', color: '#3D7FFF' },
    { id: 3, name: 'Design Pro', icon: '✨', level: 'Common', color: '#FFD93D' },
  ];

  return (
    <div className="flex gap-4">
      {/* 外包市场公告板 */}
      <motion.div
        className="bg-gradient-to-br from-[#2a3f5f] to-[#1e2d42] rounded-2xl p-5 border-4 border-[#4ECDC4]/30 shadow-2xl relative overflow-hidden"
        style={{ width: '220px' }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, #4ECDC4 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* 标题 */}
        <div className="relative z-10 mb-4 flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <ShoppingBag className="w-5 h-5 text-[#4ECDC4]" />
          </motion.div>
          <h3 className="text-sm text-white">外包市场</h3>
        </div>

        {/* 服务列表 */}
        <div className="relative z-10 space-y-2">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, x: 5 }}
              className="cursor-pointer"
            >
              <div className="bg-[#1a2332]/80 p-3 rounded-lg border border-[#4ECDC4]/20 hover:border-[#4ECDC4]/50 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{service.icon}</span>
                  <span className="text-xs text-white/90 flex-1">{service.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4ECDC4]">{service.price}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#FFD93D] fill-[#FFD93D]" />
                    <span className="text-white/70">{service.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 装饰性图钉 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-[#FF6B9D]"
            style={{
              top: `${30 + i * 25}%`,
              right: '8px',
            }}
            animate={{
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>

      {/* 技能卡装配站 */}
      <motion.div
        className="bg-gradient-to-br from-[#2a3f5f] to-[#1e2d42] rounded-2xl p-5 border-4 border-[#FFD93D]/30 shadow-2xl relative overflow-hidden"
        style={{ width: '200px' }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* 能量流动背景 */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #FFD93D 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />

        {/* 标题 */}
        <div className="relative z-10 mb-4 flex items-center gap-2">
          <motion.div
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 text-[#FFD93D]" />
          </motion.div>
          <h3 className="text-sm text-white">技能装配</h3>
        </div>

        {/* 技能卡列表 */}
        <div className="relative z-10 space-y-2">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.05, rotateZ: 5 }}
              className="cursor-grab active:cursor-grabbing"
              drag
              dragElastic={0.7}
            >
              <div 
                className="p-3 rounded-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${skill.color}44, ${skill.color}22)`,
                  border: `2px solid ${skill.color}66`,
                  boxShadow: `0 4px 12px ${skill.color}33`,
                }}
              >
                {/* 卡片光效 */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, transparent, ${skill.color}44, transparent)`,
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{skill.icon}</span>
                    <span className="text-xs text-white/90 flex-1">{skill.name}</span>
                  </div>
                  <div 
                    className="text-xs px-2 py-0.5 rounded-full inline-block"
                    style={{
                      backgroundColor: `${skill.color}33`,
                      color: skill.color,
                    }}
                  >
                    {skill.level}
                  </div>
                </div>

                {/* 星星装饰 */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${20 + i * 10}%`,
                      right: `${10 + i * 5}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    <Star className="w-2 h-2" style={{ color: skill.color }} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 装配台装饰 */}
        <motion.div
          className="relative z-10 mt-4 pt-3 border-t border-white/10 flex justify-center"
          animate={{
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <div className="text-2xl">⚡</div>
        </motion.div>
      </motion.div>
    </div>
  );
}
