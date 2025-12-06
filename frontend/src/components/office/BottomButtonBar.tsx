import { motion } from 'framer-motion';
import { ClipboardList, Users, BarChart3, ShoppingBag, Command } from 'lucide-react';
import { Task, Secretary, ModalType } from '../../types/office';

interface BottomButtonBarProps {
  onCommandClick: () => void;
  tasks: Task[];
  secretaries: Secretary[];
  onModalOpen: (modal: Exclude<ModalType, null>) => void;
}

export function BottomButtonBar({ onCommandClick, tasks, secretaries, onModalOpen }: BottomButtonBarProps) {
  const buttons = [
    {
      id: 'tasks',
      icon: ClipboardList,
      label: '任务中心',
      color: '#FFD93D',
      badge: tasks.filter(t => t.status === 'in-progress').length,
    },
    {
      id: 'secretary',
      icon: Users,
      label: '秘书处',
      color: '#FF6B9D',
      badge: secretaries.length,
    },
    {
      id: 'command',
      icon: Command,
      label: 'AI指令',
      color: '#3D7FFF',
      isCenter: true,
    },
    {
      id: 'data',
      icon: BarChart3,
      label: '数据中心',
      color: '#4ECDC4',
    },
    {
      id: 'market',
      icon: ShoppingBag,
      label: '市场',
      color: '#A8E6CF',
    },
  ];

  const handleButtonClick = (buttonId: string) => {
    if (buttonId === 'command') {
      onCommandClick();
    } else {
      onModalOpen(buttonId as Exclude<ModalType, null>);
    }
  };

  return (
    <motion.div
      className="relative z-20 bg-gradient-to-t from-[#1a2332] to-[#1a2332]/95 backdrop-blur-md border-t-2 border-[#3D7FFF]/30"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* 顶部装饰线 */}
      <motion.div
        className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#3D7FFF] to-transparent"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      <div className="px-8 py-6">
        <div className="flex items-center justify-center gap-8">
          {buttons.map((button, index) => {
            const Icon = button.icon;
            const isCenter = button.isCenter;
            
            return (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.3 + index * 0.1,
                  type: 'spring',
                  stiffness: 200,
                }}
                className="relative"
              >
                {/* 按钮主体 */}
                <motion.button
                  onClick={() => handleButtonClick(button.id)}
                  whileHover={{ scale: 1.1, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group office-btn"
                >
                  {/* 外圈发光效果 */}
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: `0 0 30px ${button.color}, 0 0 60px ${button.color}33`,
                    }}
                  />

                  {/* 中央按钮特殊效果 - 多层脉冲波纹 */}
                  {isCenter && (
                    <>
                      {/* 第一层脉冲 */}
                      <motion.div
                        className="absolute inset-[-20px] rounded-full"
                        style={{
                          border: `2px solid ${button.color}`,
                        }}
                        animate={{
                          scale: [1, 1.5, 2],
                          opacity: [0.6, 0.3, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                      />
                      {/* 第二层脉冲 */}
                      <motion.div
                        className="absolute inset-[-20px] rounded-full"
                        style={{
                          border: `2px solid ${button.color}`,
                        }}
                        animate={{
                          scale: [1, 1.5, 2],
                          opacity: [0.6, 0.3, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 0.5,
                        }}
                      />
                      {/* 第三层脉冲 */}
                      <motion.div
                        className="absolute inset-[-20px] rounded-full"
                        style={{
                          border: `2px solid ${button.color}`,
                        }}
                        animate={{
                          scale: [1, 1.5, 2],
                          opacity: [0.6, 0.3, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 1,
                        }}
                      />
                      {/* 呼吸光环 */}
                      <motion.div
                        className="absolute inset-[-8px] rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${button.color}44 0%, transparent 70%)`,
                        }}
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    </>
                  )}

                  {/* 按钮圆形 */}
                  <div
                    className={`relative rounded-full shadow-2xl overflow-hidden ${
                      isCenter ? 'w-28 h-28 border-4' : 'w-20 h-20 border-[3px]'
                    }`}
                    style={{
                      background: isCenter 
                        ? `linear-gradient(135deg, ${button.color}, ${button.color}dd, ${button.color})`
                        : `linear-gradient(135deg, ${button.color}, ${button.color}cc)`,
                      borderColor: isCenter ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                      boxShadow: isCenter 
                        ? `0 8px 32px ${button.color}66, inset 0 2px 0 rgba(255,255,255,0.3)` 
                        : `0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  >
                    {/* 按钮光效 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
                    
                    {/* 图标 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={isCenter ? {
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Icon className={`text-white drop-shadow-lg ${isCenter ? 'w-12 h-12' : 'w-8 h-8'}`} />
                      </motion.div>
                    </div>

                    {/* 中央按钮语音波形动画 */}
                    {isCenter && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-[2px]">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-white/60 rounded-full"
                            animate={{
                              height: [4, 8 + Math.random() * 8, 4],
                            }}
                            transition={{
                              duration: 0.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* 内圈动画 - 中央按钮 */}
                    {isCenter && (
                      <motion.div
                        className="absolute inset-2 border-2 border-white/20 rounded-full"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    )}

                    {/* 徽章 */}
                    {button.badge && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#FF6B9D] border-2 border-[#1a2332] flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                      >
                        <motion.span
                          className="text-xs text-white font-medium"
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                          }}
                        >
                          {button.badge}
                        </motion.span>
                      </motion.div>
                    )}
                  </div>

                  {/* 底部装饰圈 */}
                  <motion.div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full"
                    style={{
                      width: isCenter ? '100px' : '70px',
                      height: isCenter ? '16px' : '10px',
                      background: `radial-gradient(ellipse, ${button.color}${isCenter ? 'aa' : '66'}, transparent)`,
                      filter: `blur(${isCenter ? '10px' : '6px'})`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: isCenter ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: isCenter ? 1.5 : 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                </motion.button>

                {/* 标签 */}
                <motion.div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="text-xs text-white/80">{button.label}</div>
                </motion.div>

                {/* 连接线装饰 */}
                {!isCenter && (
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent to-white/20"
                    style={{
                      left: index < 2 ? '100%' : 'auto',
                      right: index > 2 ? '100%' : 'auto',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 装饰性粒子 */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#3D7FFF] rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: '20%',
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -20, -40],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </motion.div>
  );
}
