import { motion } from 'framer-motion';
import { Database, Building2, Edit2, Check, X, Upload } from 'lucide-react';
import { useState, useRef } from 'react';

interface TopBarProps {
  onDataCenterClick?: () => void;
  onCompanyStatusClick?: () => void;
}

export function TopBar({ onDataCenterClick, onCompanyStatusClick }: TopBarProps) {
  const [companyName, setCompanyName] = useState('无限公司');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(companyName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (editValue.trim()) {
      setCompanyName(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(companyName);
    setIsEditing(false);
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCompanyLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      className="relative z-20 bg-gradient-to-b from-[#1a2332] to-transparent backdrop-blur-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="px-8 py-4">
        <div className="flex items-center">
          {/* 左侧 - 公司信息（头像 + 公司名） */}
          <motion.div
            className="flex items-center gap-3 flex-shrink-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* 公司头像 - 可点击上传 */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D7FFF] to-[#4ECDC4] flex items-center justify-center shadow-lg cursor-pointer relative group overflow-hidden"
              onClick={handleLogoClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {companyLogo ? (
                <img src={companyLogo} alt="公司Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-white" />
              )}
              {/* 上传提示覆盖层 */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-4 h-4 text-white" />
              </div>
            </motion.div>
            
            {/* 公司名称（可编辑） */}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-[#0f1419]/80 border border-[#3D7FFF]/50 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#3D7FFF]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
                <button
                  onClick={handleSave}
                  className="w-7 h-7 rounded-lg bg-[#4ECDC4]/20 flex items-center justify-center hover:bg-[#4ECDC4]/40 transition-colors"
                >
                  <Check className="w-4 h-4 text-[#4ECDC4]" />
                </button>
                <button
                  onClick={handleCancel}
                  className="w-7 h-7 rounded-lg bg-[#FF6B9D]/20 flex items-center justify-center hover:bg-[#FF6B9D]/40 transition-colors"
                >
                  <X className="w-4 h-4 text-[#FF6B9D]" />
                </button>
              </div>
            ) : (
              <motion.div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-white font-medium text-lg">{companyName}</span>
                <Edit2 className="w-3.5 h-3.5 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            )}
          </motion.div>

          {/* 中间 - 状态按钮（居中布局） */}
          <div className="flex-1 flex items-center justify-center gap-4">
            {/* 公司状态按钮 */}
            <motion.button
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#0f1419]/60 border border-[#3D7FFF]/30 backdrop-blur-sm cursor-pointer"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ 
                scale: 1.05, 
                borderColor: 'rgba(61, 127, 255, 0.6)',
                boxShadow: '0 0 20px rgba(61, 127, 255, 0.2)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onCompanyStatusClick}
            >
              <div className="w-8 h-8 rounded-lg bg-[#3D7FFF]/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#3D7FFF]" />
              </div>
              <span className="text-white text-sm font-medium">公司状态</span>
              <motion.div
                className="w-2 h-2 rounded-full bg-[#4ECDC4]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </motion.button>

            {/* 数据中心按钮 */}
            <motion.button
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#0f1419]/60 border border-[#4ECDC4]/30 backdrop-blur-sm cursor-pointer"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                borderColor: 'rgba(78, 205, 196, 0.6)',
                boxShadow: '0 0 20px rgba(78, 205, 196, 0.2)'
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onDataCenterClick}
            >
              <div className="w-8 h-8 rounded-lg bg-[#4ECDC4]/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-[#4ECDC4]" />
              </div>
              <span className="text-white text-sm font-medium">数据中心</span>
              <motion.div
                className="w-2 h-2 rounded-full bg-[#4ECDC4]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />
            </motion.button>
          </div>
          
          {/* 右侧占位，保持左右平衡 */}
          <div className="w-[200px] flex-shrink-0" />
        </div>
      </div>
    </motion.div>
  );
}