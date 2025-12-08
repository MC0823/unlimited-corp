import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface RoomProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  floorColor?: string;
  width?: number;
  height?: number;
  children: ReactNode;
  delay?: number;
}

export function Room({ 
  name, 
  icon, 
  color, 
  floorColor = '#E8F5E9',
  width = 240, 
  height = 180, 
  children, 
  delay = 0 
}: RoomProps) {
  const wallHeight = 50;
  const wallThickness = 8;

  return (
    <motion.div
      className="relative"
      style={{
        width: `${width}px`,
        height: `${height + wallHeight}px`,
        transformStyle: 'preserve-3d',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* 后墙 - 左侧 */}
      <div
        className="absolute"
        style={{
          width: `${width}px`,
          height: `${wallHeight}px`,
          left: 0,
          top: 0,
          background: color,
          borderTop: `3px solid ${adjustColor(color, -30)}`,
          borderLeft: `3px solid ${adjustColor(color, -20)}`,
        }}
      >
        {/* 房间标牌 */}
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2 flex items-center gap-2 px-3 py-1 rounded-md"
          style={{
            background: 'rgba(255,255,255,0.9)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-gray-700">{name}</span>
        </div>
      </div>

      {/* 右墙 */}
      <div
        className="absolute"
        style={{
          width: `${wallThickness}px`,
          height: `${height}px`,
          right: 0,
          top: `${wallHeight}px`,
          background: adjustColor(color, -15),
          borderRight: `2px solid ${adjustColor(color, -40)}`,
        }}
      />

      {/* 地板 - 纯色明亮 */}
      <div
        className="absolute overflow-hidden"
        style={{
          width: `${width - wallThickness}px`,
          height: `${height}px`,
          left: 0,
          top: `${wallHeight}px`,
          background: floorColor,
          borderLeft: `3px solid ${adjustColor(color, -20)}`,
          borderBottom: `3px solid ${adjustColor(floorColor, -20)}`,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
        }}
      >
        {/* 房间内容 */}
        <div className="relative w-full h-full p-3">
          {children}
        </div>
      </div>

      {/* 墙壁接缝阴影 */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '4px',
          height: `${height}px`,
          left: `${width - wallThickness - 2}px`,
          top: `${wallHeight}px`,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.1), transparent)',
        }}
      />
    </motion.div>
  );
}

// 调整颜色明暗度
function adjustColor(hex: string, amount: number): string {
  const color = hex.replace('#', '');
  const num = parseInt(color, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
