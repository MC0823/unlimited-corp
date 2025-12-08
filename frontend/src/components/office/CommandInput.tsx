import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface CommandInputProps {
  onClose: () => void;
}

export function CommandInput({ onClose }: CommandInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // 模拟指令处理
      console.log('执行指令:', input);
      setInput('');
      // 延迟关闭，显示执行效果
      setTimeout(onClose, 500);
    }
  };

  const quickCommands = [
    { icon: '🚀', text: '启动新项目' },
    { icon: '📊', text: '生成周报' },
    { icon: '👥', text: '招募新员工' },
    { icon: '⚡', text: '优化团队效率' },
  ];

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 背景遮罩 */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* 指令输入框主体 */}
        <motion.div
          className="relative rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 95, 0.95) 0%, rgba(30, 45, 66, 0.98) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 0 100px rgba(61, 127, 255, 0.3), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* 玻璃态光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.1] to-transparent pointer-events-none" />
          
          {/* 边缘发光 */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{
              boxShadow: [
                'inset 0 0 30px rgba(61, 127, 255, 0.1)',
                'inset 0 0 50px rgba(61, 127, 255, 0.2)',
                'inset 0 0 30px rgba(61, 127, 255, 0.1)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* 顶部发光条 */}
          <motion.div
            className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#3D7FFF] to-transparent"
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />

          {/* 关闭按钮 */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-6 right-6 z-20 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 office-btn"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          {/* 内容区域 */}
          <div className="relative z-10 p-8">
            {/* 标题 */}
            <motion.div
              className="text-center mb-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center gap-3 mb-2"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Sparkles className="w-8 h-8 text-[#FFD93D]" />
                <h2 className="text-white text-3xl font-medium">AI 指令中枢</h2>
                <Sparkles className="w-8 h-8 text-[#FFD93D]" />
              </motion.div>
              <p className="text-white/60">告诉我你的需求，我会立即执行</p>
            </motion.div>

            {/* 输入表单 */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="relative">
                {/* 输入框 */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入指令或使用语音..."
                  autoFocus
                  className="w-full px-6 py-5 pr-32 rounded-2xl bg-[#1a2332] border-2 border-[#3D7FFF]/30 text-white placeholder-white/40 focus:outline-none focus:border-[#3D7FFF] transition-colors text-lg"
                  style={{
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
                  }}
                />

                {/* 按钮组 */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  {/* 语音输入按钮 */}
                  <motion.button
                    type="button"
                    onClick={() => setIsListening(!isListening)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors office-btn"
                    style={{
                      backgroundColor: isListening ? '#FF6B9D' : '#3D7FFF',
                      boxShadow: isListening ? '0 0 20px rgba(255, 107, 157, 0.4)' : '0 0 15px rgba(61, 127, 255, 0.3)',
                    }}
                  >
                    <motion.div
                      animate={isListening ? {
                        scale: [1, 1.2, 1],
                      } : {}}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    >
                      <Mic className="w-5 h-5 text-white" />
                    </motion.div>
                  </motion.button>

                  {/* 发送按钮 */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!input.trim()}
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg office-btn"
                    style={{
                      boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)'
                    }}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </motion.button>
                </div>

                {/* 输入框光效 */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(61, 127, 255, 0.2)',
                      '0 0 30px rgba(61, 127, 255, 0.4)',
                      '0 0 20px rgba(61, 127, 255, 0.2)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.form>

            {/* 快捷指令 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-sm text-white/60 mb-3">快捷指令</div>
              <div className="grid grid-cols-2 gap-3">
                {quickCommands.map((cmd, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInput(cmd.text)}
                    className="p-4 rounded-xl bg-[#1a2332]/60 border-2 border-[#3D7FFF]/20 hover:border-[#3D7FFF]/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="text-2xl"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {cmd.icon}
                      </motion.div>
                      <span className="text-white/90 group-hover:text-white transition-colors">
                        {cmd.text}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* 提示文字 */}
            <motion.div
              className="mt-6 text-center text-xs text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  ⚡
                </motion.div>
                <span>由无限公司 AI 助手提供支持</span>
              </div>
            </motion.div>
          </div>

          {/* 装饰性粒子 */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#4ECDC4] rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* 底部扫描线 */}
          <motion.div
            className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#3D7FFF] to-transparent"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
