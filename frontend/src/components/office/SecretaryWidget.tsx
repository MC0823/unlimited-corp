import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Secretary } from '../../types/office';

interface SecretaryMessage {
  id: string;
  secretaryId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface SecretaryWidgetProps {
  secretaries: Secretary[];
  onSecretaryClick?: (secretary: Secretary) => void;
}

// Q版秘书形象组件 - 纯透明背景
function QSecretary({ type, size = 48 }: { type: string; size?: number }) {
  const getColors = () => {
    switch (type) {
      case 'business':
        return { hair: '#4A3728', skin: '#E8C4A0', dress: '#3D7FFF', accent: '#2a5fd4' };
      case 'life':
        return { hair: '#8B4513', skin: '#DEB887', dress: '#4ECDC4', accent: '#3db8b0' };
      case 'personal':
        return { hair: '#2C1810', skin: '#D2B48C', dress: '#FF6B9D', accent: '#e85a87' };
      default:
        return { hair: '#4A3728', skin: '#E8C4A0', dress: '#3D7FFF', accent: '#2a5fd4' };
    }
  };

  const colors = getColors();

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* 身体/裙子 */}
      <ellipse cx="24" cy="42" rx="14" ry="8" fill={colors.dress} />
      <path d="M10 42 Q24 30 38 42" fill={colors.dress} />
      
      {/* 脖子 */}
      <rect x="21" y="28" width="6" height="4" rx="2" fill={colors.skin} />
      
      {/* 脸 */}
      <circle cx="24" cy="18" r="12" fill={colors.skin} />
      
      {/* 头发 */}
      <path d="M12 18 Q12 6 24 6 Q36 6 36 18 Q36 14 32 12 Q28 10 24 10 Q20 10 16 12 Q12 14 12 18" fill={colors.hair} />
      <ellipse cx="12" cy="16" rx="2" ry="4" fill={colors.hair} />
      <ellipse cx="36" cy="16" rx="2" ry="4" fill={colors.hair} />
      
      {/* 眼睛 */}
      <circle cx="19" cy="18" r="2.5" fill="#2C1810" />
      <circle cx="29" cy="18" r="2.5" fill="#2C1810" />
      <circle cx="19.8" cy="17.2" r="0.8" fill="white" />
      <circle cx="29.8" cy="17.2" r="0.8" fill="white" />
      
      {/* 脸红 */}
      <ellipse cx="15" cy="22" rx="2" ry="1" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="33" cy="22" rx="2" ry="1" fill="#FFB6C1" opacity="0.6" />
      
      {/* 嘴巴 */}
      <path d="M22 24 Q24 26 26 24" stroke="#E88B8B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      
      {/* 配饰 - 根据类型不同 */}
      {type === 'business' && (
        <>
          {/* 眼镜 */}
          <circle cx="19" cy="18" r="4" stroke="#333" strokeWidth="1" fill="none" />
          <circle cx="29" cy="18" r="4" stroke="#333" strokeWidth="1" fill="none" />
          <line x1="23" y1="18" x2="25" y2="18" stroke="#333" strokeWidth="1" />
        </>
      )}
      {type === 'life' && (
        <>
          {/* 发卡 */}
          <circle cx="14" cy="10" r="3" fill="#FFD93D" />
          <circle cx="14" cy="10" r="1.5" fill="#FFF" opacity="0.5" />
        </>
      )}
      {type === 'personal' && (
        <>
          {/* 耳机 */}
          <rect x="8" y="14" width="4" height="8" rx="2" fill="#333" />
          <rect x="36" y="14" width="4" height="8" rx="2" fill="#333" />
          <path d="M10 10 Q24 4 38 10" stroke="#333" strokeWidth="2" fill="none" />
        </>
      )}
    </svg>
  );
}

export function SecretaryWidget({ secretaries, onSecretaryClick }: SecretaryWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMessage, setActiveMessage] = useState<SecretaryMessage | null>(null);
  const [messages, setMessages] = useState<SecretaryMessage[]>([]);

  // 模拟消息推送
  useEffect(() => {
    const demoMessages: SecretaryMessage[] = [
      { id: 'm1', secretaryId: 's1', content: '本周财务报告已准备完毕，请查阅', timestamp: new Date(), isRead: false },
      { id: 'm2', secretaryId: 's2', content: '今日下午3点有重要会议', timestamp: new Date(), isRead: false },
      { id: 'm3', secretaryId: 's3', content: '您有5条未读消息待处理', timestamp: new Date(), isRead: false },
    ];
    
    // 延迟显示第一条消息
    const timer = setTimeout(() => {
      setMessages(demoMessages);
      setActiveMessage(demoMessages[0]);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 自动隐藏消息气泡
  useEffect(() => {
    if (activeMessage) {
      const timer = setTimeout(() => {
        setActiveMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeMessage]);

  const getSecretaryById = (id: string) => secretaries.find(s => s.id === id);
  const unreadCount = messages.filter(m => !m.isRead).length;

  // 获取当前显示的秘书
  const currentSecretary = activeMessage ? getSecretaryById(activeMessage.secretaryId) : secretaries[0];

  const handleDismissMessage = () => {
    if (activeMessage) {
      setMessages(prev => prev.map(m => 
        m.id === activeMessage.id ? { ...m, isRead: true } : m
      ));
      setActiveMessage(null);
    }
  };

  return (
    <div className="fixed bottom-28 right-4 z-40">
      {/* 消息气泡 */}
      <AnimatePresence>
        {activeMessage && !isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 w-64"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
          >
            <div className="relative bg-[#0f1419]/95 backdrop-blur-md rounded-2xl p-3 border border-[#3D7FFF]/30 shadow-xl shadow-[#3D7FFF]/10">
              {/* 关闭按钮 */}
              <button
                onClick={handleDismissMessage}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-3 h-3 text-white/60" />
              </button>

              {/* 消息内容 */}
              <div className="text-white/80 text-sm pr-6">
                {activeMessage.content}
              </div>

              {/* 三角箭头 */}
              <div
                className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 bg-[#0f1419]/95 border-r border-b border-[#3D7FFF]/30"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 秘书展开面板 - 科技色背景 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 w-56 bg-gradient-to-br from-[#1a2332] to-[#0f1419] backdrop-blur-md rounded-2xl border border-[#3D7FFF]/40 shadow-xl shadow-[#3D7FFF]/20 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
          >
            <div className="p-3 border-b border-[#3D7FFF]/30 bg-gradient-to-r from-[#3D7FFF]/20 to-[#4ECDC4]/10">
              <h3 className="text-[#4ECDC4] text-sm font-medium">秘书团队</h3>
            </div>
            <div className="p-2 space-y-1">
              {secretaries.map((secretary) => {
                const hasUnread = messages.some(m => m.secretaryId === secretary.id && !m.isRead);
                return (
                  <motion.button
                    key={secretary.id}
                    className="w-full p-2.5 rounded-xl bg-[#1a2332]/60 hover:bg-[#3D7FFF]/30 transition-colors flex items-center gap-3 text-left relative border border-transparent hover:border-[#3D7FFF]/30"
                    whileHover={{ x: 4 }}
                    onClick={() => onSecretaryClick?.(secretary)}
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3D7FFF]/20 to-[#4ECDC4]/20 flex items-center justify-center">
                        <QSecretary type={secretary.type} size={32} />
                      </div>
                      {hasUnread && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF6B9D] rounded-full border border-[#0f1419]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#4ECDC4] text-xs font-medium truncate">{secretary.name.split(' ')[0]}</div>
                      <div className="text-white/60 text-xs truncate">{secretary.status}</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主按钮 - Q版秘书形象（纯透明背景） */}
      <motion.button
        className="relative office-btn bg-transparent border-none outline-none p-0 m-0"
        style={{ background: 'none', backgroundColor: 'transparent' }}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Q版秘书形象 - 纯透明背景 */}
        <motion.div
          className="relative bg-transparent"
          style={{ background: 'transparent' }}
          animate={{
            y: activeMessage ? [0, -4, 0] : 0,
          }}
          transition={{
            y: { duration: 0.5, repeat: activeMessage ? Infinity : 0, repeatDelay: 1 }
          }}
        >
          {/* 秘书SVG - 纯头像无背景 */}
          <QSecretary type={currentSecretary?.type || 'business'} size={56} />
          
          {/* 未读消息徽章 */}
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6B9D] flex items-center justify-center shadow-lg border-2 border-[#0f1419]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <span className="text-[10px] text-white font-bold">{unreadCount}</span>
            </motion.div>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}
