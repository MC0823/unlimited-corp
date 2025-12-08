import { motion } from 'motion/react';
import { Mic, Command } from 'lucide-react';

interface CEODeskProps {
  onCommandClick: () => void;
}

export function CEODesk({ onCommandClick }: CEODeskProps) {
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
    >
      {/* CEO 办公桌 */}
      <div 
        className="w-48 h-32 rounded-lg relative overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #3d2817 0%, #2a1810 100%)',
          transform: 'perspective(300px) rotateX(25deg)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
        }}
      >
        {/* 木纹质感 */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)',
          }}
        />

        {/* 桌面物品 */}
        <div className="absolute inset-0 p-4 flex items-center justify-center gap-4">
          {/* 复古麦克风 / 指令发射器 */}
          <motion.div
            onClick={onCommandClick}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer group relative"
          >
            <div className="relative">
              {/* 麦克风底座 */}
              <div className="w-12 h-3 bg-gradient-to-b from-[#D4A574] to-[#8B7355] rounded-full mb-1" />
              
              {/* 麦克风主体 */}
              <div className="w-10 h-14 mx-auto bg-gradient-to-br from-[#D4A574] to-[#8B7355] rounded-t-full rounded-b-lg relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                
                {/* 网格纹理 */}
                <div className="absolute inset-x-2 top-2 bottom-2 rounded-full"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 3px)',
                  }}
                />

                {/* 发光指示灯 */}
                <motion.div
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#4ECDC4]"
                  animate={{
                    opacity: [1, 0.5, 1],
                    boxShadow: ['0 0 5px #4ECDC4', '0 0 10px #4ECDC4', '0 0 5px #4ECDC4'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>

              {/* 悬停提示 */}
              <motion.div
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ y: 5 }}
                animate={{ y: 0 }}
              >
                <div className="bg-[#3D7FFF] text-white text-xs px-3 py-1 rounded shadow-lg">
                  <div className="flex items-center gap-1">
                    <Command className="w-3 h-3" />
                    <span>发送指令</span>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#3D7FFF] rotate-45" />
                </div>
              </motion.div>

              {/* 声波效果 */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [0.5, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <div className="w-16 h-16 border-2 border-[#3D7FFF] rounded-full" />
              </motion.div>
            </div>
          </motion.div>

          {/* 笔记本电脑装饰 */}
          <motion.div
            className="w-16 h-12 bg-gradient-to-br from-[#4a4a4a] to-[#2a2a2a] rounded-sm relative"
            style={{
              transform: 'perspective(100px) rotateY(-20deg)',
            }}
            animate={{
              boxShadow: ['0 0 10px rgba(61,127,255,0.3)', '0 0 20px rgba(61,127,255,0.5)', '0 0 10px rgba(61,127,255,0.3)'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            {/* 屏幕 */}
            <div className="absolute inset-1 bg-gradient-to-br from-[#3D7FFF]/50 to-[#1a3d6f]/50 rounded-sm flex items-center justify-center">
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Mic className="w-4 h-4 text-[#4ECDC4]" />
              </motion.div>
            </div>

            {/* 键盘底座 */}
            <div className="absolute top-full left-0 right-0 h-1 bg-gradient-to-b from-[#4a4a4a] to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* 办公桌阴影 */}
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/30 blur-xl rounded-full"
      />

      {/* CEO 铭牌 */}
      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4A574] to-[#8B7355] px-4 py-1 rounded shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-xs text-white text-center">CEO OFFICE</div>
      </motion.div>
    </motion.div>
  );
}
