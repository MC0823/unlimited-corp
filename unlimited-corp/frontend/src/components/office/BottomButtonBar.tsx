import { motion } from 'framer-motion';
import { Building2, Users, Sparkles, ShoppingBag, Command } from 'lucide-react';
import { useState } from 'react';
import { Task, Secretary, ModalType } from '../../types/office';

interface BottomButtonBarProps {
  onCommandClick: () => void;
  tasks: Task[];
  secretaries: Secretary[];
  onModalOpen: (modal: Exclude<ModalType, null>) => void;
  onDepartmentClick?: () => void;
}

export function BottomButtonBar({ onCommandClick, tasks: _tasks, secretaries: _secretaries, onModalOpen, onDepartmentClick }: BottomButtonBarProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const buttons = [
    {
      id: 'department',
      icon: Building2,
      label: '部门',
      color: '#FFD93D',
    },
    {
      id: 'employee',
      icon: Users,
      label: '员工',
      color: '#FF6B9D',
    },
    {
      id: 'command',
      icon: Command,
      label: 'AI指令',
      color: '#3D7FFF',
      isCenter: true,
    },
    {
      id: 'skill',
      icon: Sparkles,
      label: '技能',
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
    } else if (buttonId === 'department' && onDepartmentClick) {
      onDepartmentClick();
    } else {
      onModalOpen(buttonId as Exclude<ModalType, null>);
    }
  };

  return (
    <motion.div
      className="relative z-20 bg-gradient-to-t from-[#1a2332] to-transparent backdrop-blur-md"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
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
                className="relative flex flex-col items-center"
              >
                {/* 按钮主体 */}
                <motion.button
                  onClick={() => handleButtonClick(button.id)}
                  whileHover={{ scale: 1.1, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setHoveredButton(button.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                  className="relative group office-btn"
                >
                  {/* 外圈发光效果 */}
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: `0 0 30px ${button.color}, 0 0 60px ${button.color}33`,
                    }}
                  />

                  {/* 中央按钮特殊效果 - 圆形脉冲波纹 (鼠标悬停显示/移开渐隐) */}
                  {isCenter && hoveredButton === button.id && (
                    <>
                      {/* 第一层圆形脉冲 - 使用key强制重新挂载避免闪现 */}
                      <motion.div
                        key="pulse-1"
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: '80px',
                          height: '80px',
                          top: '50%',
                          left: '50%',
                          marginTop: '-40px',
                          marginLeft: '-40px',
                          border: `2px solid ${button.color}`,
                        }}
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{
                          opacity: [0.6, 0.3, 0],
                          scale: [1, 1.8, 2.5],
                        }}
                        transition={{
                          duration: 2.5,
                          times: [0, 0.5, 1],
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                      />
                      {/* 第二层圆形脉冲 */}
                      <motion.div
                        key="pulse-2"
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: '80px',
                          height: '80px',
                          top: '50%',
                          left: '50%',
                          marginTop: '-40px',
                          marginLeft: '-40px',
                          border: `2px solid ${button.color}`,
                        }}
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{
                          opacity: [0.6, 0.3, 0],
                          scale: [1, 1.8, 2.5],
                        }}
                        transition={{
                          duration: 2.5,
                          times: [0, 0.5, 1],
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 0.4,
                        }}
                      />
                      {/* 第三层圆形脉冲 */}
                      <motion.div
                        key="pulse-3"
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: '80px',
                          height: '80px',
                          top: '50%',
                          left: '50%',
                          marginTop: '-40px',
                          marginLeft: '-40px',
                          border: `2px solid ${button.color}`,
                        }}
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{
                          opacity: [0.6, 0.3, 0],
                          scale: [1, 1.8, 2.5],
                        }}
                        transition={{
                          duration: 2.5,
                          times: [0, 0.5, 1],
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 0.8,
                        }}
                      />
                      {/* 圆形呼吸光环 */}
                      <motion.div
                        key="glow"
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: '80px',
                          height: '80px',
                          top: '50%',
                          left: '50%',
                          marginTop: '-40px',
                          marginLeft: '-40px',
                          background: `radial-gradient(circle, ${button.color}44 0%, transparent 70%)`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 0.8,
                          scale: [1, 1.15, 1],
                        }}
                        transition={{
                          opacity: { duration: 0.3 },
                          scale: {
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }}
                      />
                    </>
                  )}

                  {/* 按钮圆形 */}
                  <div
                    className={`relative rounded-full shadow-2xl overflow-hidden ${
                      isCenter ? 'w-20 h-20 border-[3px]' : 'w-16 h-16 border-[3px]'
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
                        <Icon className={`text-white drop-shadow-lg ${isCenter ? 'w-9 h-9' : 'w-7 h-7'}`} />
                      </motion.div>
                    </div>

                    {/* 中央按钮语音波形动画 */}
                    {isCenter && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-[2px]">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 bg-white/60 rounded-full"
                            animate={{
                              height: [3, 6 + Math.random() * 6, 3],
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
                  </div>

                  {/* 底部圆形装饰 */}
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                    style={{
                      width: isCenter ? '48px' : '40px',
                      height: isCenter ? '48px' : '40px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${button.color}${isCenter ? '66' : '44'}, transparent 70%)`,
                      filter: `blur(${isCenter ? '10px' : '6px'})`,
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: isCenter ? [0.4, 0.7, 0.4] : [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: isCenter ? 1.5 : 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                </motion.button>

                {/* 标签 - 统一对齐 */}
                <div className="mt-3 text-center">
                  <span className="text-xs text-white/80">{button.label}</span>
                </div>

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
