import { motion } from 'framer-motion';
import { Zap, Coffee, Brain } from 'lucide-react';
import { Employee, QAvatar } from '../../types/office';

interface QEmployeeProps {
  employee: Employee;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  delay?: number;
}

// 默认Q版形象配置
const defaultAvatars: Record<string, QAvatar> = {
  developer: {
    headShape: 'round',
    hairStyle: 'short',
    hairColor: '#2D3748',
    skinTone: '#FDBF6F',
    eyeStyle: 'glasses',
    expression: 'focused',
    accessory: 'headphones'
  },
  designer: {
    headShape: 'oval',
    hairStyle: 'ponytail',
    hairColor: '#9B59B6',
    skinTone: '#FFE4C4',
    eyeStyle: 'big',
    expression: 'happy',
    accessory: 'bow'
  },
  marketer: {
    headShape: 'round',
    hairStyle: 'curly',
    hairColor: '#E67E22',
    skinTone: '#DEB887',
    eyeStyle: 'normal',
    expression: 'excited',
    accessory: 'none'
  },
  analyst: {
    headShape: 'square',
    hairStyle: 'short',
    hairColor: '#1A1A2E',
    skinTone: '#FFEAA7',
    eyeStyle: 'glasses',
    expression: 'focused',
    accessory: 'none'
  }
};

export function QEmployee({ employee, onClick, size = 'md', delay = 0 }: QEmployeeProps) {
  const avatar = employee.avatar || defaultAvatars[employee.role];
  
  const sizeConfig = {
    sm: { wrapper: 'w-16', head: 48, body: 24 },
    md: { wrapper: 'w-20', head: 56, body: 28 },
    lg: { wrapper: 'w-24', head: 64, body: 32 }
  };
  
  const config = sizeConfig[size];

  const getStatusColor = () => {
    switch (employee.status) {
      case 'working': return '#FFD93D';
      case 'tired': return '#FF6B9D';
      default: return '#4ECDC4';
    }
  };

  const getStatusIcon = () => {
    switch (employee.status) {
      case 'working': return <Zap className="w-2.5 h-2.5 text-gray-800" />;
      case 'tired': return <Coffee className="w-2.5 h-2.5 text-white" />;
      default: return <Brain className="w-2.5 h-2.5 text-gray-800" />;
    }
  };

  const getExpression = () => {
    // 根据状态调整表情
    if (employee.status === 'tired') return 'tired';
    if (employee.status === 'working') return 'focused';
    return avatar.expression;
  };

  const renderEyes = () => {
    const expression = getExpression();
    const isGlasses = avatar.eyeStyle === 'glasses';
    const isBig = avatar.eyeStyle === 'big';
    const isSleepy = avatar.eyeStyle === 'sleepy' || expression === 'tired';
    
    return (
      <div className="flex gap-2 justify-center" style={{ marginTop: '28%' }}>
        {/* 左眼 */}
        <div className="relative">
          {isGlasses && (
            <div className="absolute -inset-1 border-2 border-gray-600 rounded-full bg-white/20" />
          )}
          <motion.div
            className="rounded-full bg-gray-800"
            style={{
              width: isBig ? 8 : 6,
              height: isSleepy ? 2 : (isBig ? 8 : 6),
            }}
            animate={expression === 'happy' ? { scaleY: [1, 0.3, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        </div>
        {/* 右眼 */}
        <div className="relative">
          {isGlasses && (
            <div className="absolute -inset-1 border-2 border-gray-600 rounded-full bg-white/20" />
          )}
          <motion.div
            className="rounded-full bg-gray-800"
            style={{
              width: isBig ? 8 : 6,
              height: isSleepy ? 2 : (isBig ? 8 : 6),
            }}
            animate={expression === 'happy' ? { scaleY: [1, 0.3, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
        </div>
        {/* 眼镜横梁 */}
        {isGlasses && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-gray-600" />
        )}
      </div>
    );
  };

  const renderMouth = () => {
    const expression = getExpression();
    
    if (expression === 'tired') {
      return <div className="w-3 h-0.5 bg-gray-600 rounded-full mt-1" />;
    }
    if (expression === 'happy' || expression === 'excited') {
      return (
        <div className="w-4 h-2 border-b-2 border-gray-700 rounded-b-full mt-1" />
      );
    }
    // focused
    return <div className="w-2 h-2 bg-gray-600 rounded-full mt-1" />;
  };

  const renderHair = () => {
    const { hairStyle, hairColor } = avatar;
    
    switch (hairStyle) {
      case 'short':
        return (
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-[90%] h-[40%] rounded-t-full"
            style={{ backgroundColor: hairColor }}
          />
        );
      case 'long':
        return (
          <>
            <div 
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-[95%] h-[45%] rounded-t-full"
              style={{ backgroundColor: hairColor }}
            />
            <div 
              className="absolute top-1/2 -left-1 w-3 h-8 rounded-b-full"
              style={{ backgroundColor: hairColor }}
            />
            <div 
              className="absolute top-1/2 -right-1 w-3 h-8 rounded-b-full"
              style={{ backgroundColor: hairColor }}
            />
          </>
        );
      case 'curly':
        return (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-0.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2.5 h-3 rounded-full"
                style={{ backgroundColor: hairColor }}
              />
            ))}
          </div>
        );
      case 'ponytail':
        return (
          <>
            <div 
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-[85%] h-[38%] rounded-t-full"
              style={{ backgroundColor: hairColor }}
            />
            <div 
              className="absolute -top-3 right-0 w-3 h-6 rounded-full"
              style={{ backgroundColor: hairColor }}
            />
          </>
        );
      case 'bald':
      default:
        return null;
    }
  };

  const renderAccessory = () => {
    if (!avatar.accessory || avatar.accessory === 'none') return null;
    
    switch (avatar.accessory) {
      case 'headphones':
        return (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110%] h-2 bg-gray-700 rounded-t-full" />
            <div className="absolute top-1/4 -left-2 w-3 h-4 bg-gray-700 rounded-full" />
            <div className="absolute top-1/4 -right-2 w-3 h-4 bg-gray-700 rounded-full" />
          </>
        );
      case 'hat':
        return (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-[#3D7FFF] rounded-t-lg" />
        );
      case 'bow':
        return (
          <div className="absolute -top-1 right-0 text-lg">🎀</div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1, y: -5 }}
      onClick={onClick}
      className={`${config.wrapper} cursor-pointer group relative flex flex-col items-center`}
    >
      {/* Q版头部 */}
      <motion.div
        className="relative"
        animate={employee.status === 'working' ? { y: [0, -2, 0] } : 
                 employee.status === 'tired' ? { rotate: [-2, 2, -2] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* 头部主体 */}
        <div
          className="relative rounded-full border-4 border-white/20 shadow-lg flex flex-col items-center justify-center overflow-visible"
          style={{
            width: config.head,
            height: config.head,
            backgroundColor: avatar.skinTone,
          }}
        >
          {/* 头发 */}
          {renderHair()}
          
          {/* 眼睛 */}
          {renderEyes()}
          
          {/* 嘴巴 */}
          {renderMouth()}
          
          {/* 腮红 */}
          <div className="absolute bottom-[30%] left-1 w-2 h-1 bg-pink-300/50 rounded-full" />
          <div className="absolute bottom-[30%] right-1 w-2 h-1 bg-pink-300/50 rounded-full" />
          
          {/* 配饰 */}
          {renderAccessory()}
        </div>

        {/* 状态指示器 */}
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1e2936] flex items-center justify-center shadow-md"
          style={{ backgroundColor: getStatusColor() }}
          animate={employee.status === 'idle' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {getStatusIcon()}
        </motion.div>

        {/* 工作中气泡 */}
        {employee.status === 'working' && employee.currentTask && (
          <motion.div
            className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 rounded-full px-2 py-0.5 text-xs whitespace-nowrap shadow-md"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gray-700 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#3D7FFF] animate-pulse" />
              工作中
            </span>
          </motion.div>
        )}

        {/* 疲惫Z字符 */}
        {employee.status === 'tired' && (
          <motion.div
            className="absolute -right-4 -top-2 text-lg"
            animate={{ opacity: [0, 1, 0], y: [0, -8, -16], x: [0, 4, 8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💤
          </motion.div>
        )}
      </motion.div>

      {/* Q版身体 */}
      <div
        className="rounded-b-xl -mt-1 shadow-md"
        style={{
          width: config.body,
          height: config.body * 0.8,
          backgroundColor: employee.avatarColor,
        }}
      />

      {/* 名称标签 */}
      <div className="mt-2 text-center">
        <div className="text-xs text-white/90 font-medium truncate max-w-20">{employee.name}</div>
        <div className="text-[10px] text-white/50">{employee.performance}%</div>
      </div>

      {/* 进度条 */}
      {employee.status === 'working' && (
        <motion.div
          className="w-full mt-1 h-1 bg-[#1e2936] rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}aa)` }}
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* 悬停发光效果 */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: `0 0 20px ${getStatusColor()}40` }}
      />
    </motion.div>
  );
}
