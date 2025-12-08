import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit3, Check, Building2 } from 'lucide-react';
import { Department } from '../../types/office';

interface DepartmentManageModalProps {
  departments: Department[];
  onClose: () => void;
  onAdd: (department: Omit<Department, 'id'>) => void;
  onUpdate: (department: Department) => void;
  onDelete: (departmentId: string) => void;
}

// 预设颜色
const presetColors = [
  '#FF6B9D', '#4ECDC4', '#FFD93D', '#A8E6CF', 
  '#C7CEEA', '#3D7FFF', '#FF8C42', '#98D8C8'
];

// 预设图标
const presetIcons = [
  '💻', '🎨', '📢', '📊', '🔧', '📝', '🎯', '💡',
  '🚀', '📱', '🎬', '📦', '🔬', '💼', '🎪', '🌟'
];

export function DepartmentManageModal({
  departments,
  onClose,
  onAdd,
  onUpdate,
  onDelete
}: DepartmentManageModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDept, setNewDept] = useState({ name: '', icon: '💼', color: '#3D7FFF', description: '' });
  const [editDept, setEditDept] = useState<Department | null>(null);

  const handleAdd = () => {
    if (!newDept.name.trim()) return;
    onAdd(newDept);
    setNewDept({ name: '', icon: '💼', color: '#3D7FFF', description: '' });
    setIsAdding(false);
  };

  const handleUpdate = () => {
    if (!editDept || !editDept.name.trim()) return;
    onUpdate(editDept);
    setEditingId(null);
    setEditDept(null);
  };

  const startEdit = (dept: Department) => {
    setEditingId(dept.id);
    setEditDept({ ...dept });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <motion.div
        className="relative bg-[#1e2936] rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D7FFF]/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#3D7FFF]" />
            </div>
            <div>
              <h2 className="text-white font-semibold">部门管理</h2>
              <p className="text-white/50 text-xs">管理公司部门结构</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 部门列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {departments.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 rounded-xl p-3 group"
              >
                {editingId === dept.id && editDept ? (
                  // 编辑模式
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editDept.name}
                        onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
                        className="flex-1 bg-[#1e2936] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3D7FFF]"
                        placeholder="部门名称"
                      />
                      <button
                        onClick={handleUpdate}
                        className="w-9 h-9 rounded-lg bg-[#4ECDC4] flex items-center justify-center text-white"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditDept(null); }}
                        className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* 图标选择 */}
                    <div className="flex flex-wrap gap-1">
                      {presetIcons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setEditDept({ ...editDept, icon })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                            editDept.icon === icon ? 'bg-[#3D7FFF]/30 scale-110' : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>

                    {/* 颜色选择 */}
                    <div className="flex flex-wrap gap-1">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditDept({ ...editDept, color })}
                          className={`w-6 h-6 rounded-full transition-all ${
                            editDept.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e2936] scale-110' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  // 查看模式
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: dept.color }}
                      >
                        {dept.icon}
                      </div>
                      <div>
                        <div className="text-white font-medium">{dept.name}</div>
                        {dept.description && (
                          <div className="text-white/40 text-xs">{dept.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(dept)}
                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(dept.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 空状态 */}
          {departments.length === 0 && !isAdding && (
            <div className="text-center py-8 text-white/30">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>暂无部门</p>
              <p className="text-xs mt-1">点击下方按钮添加第一个部门</p>
            </div>
          )}

          {/* 添加新部门表单 */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#3D7FFF]/10 rounded-xl p-4 border border-[#3D7FFF]/30 space-y-3"
              >
                <input
                  type="text"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="w-full bg-[#1e2936] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3D7FFF]"
                  placeholder="部门名称"
                  autoFocus
                />

                {/* 图标选择 */}
                <div>
                  <div className="text-white/50 text-xs mb-2">选择图标</div>
                  <div className="flex flex-wrap gap-1">
                    {presetIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewDept({ ...newDept, icon })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                          newDept.icon === icon ? 'bg-[#3D7FFF]/30 scale-110' : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 颜色选择 */}
                <div>
                  <div className="text-white/50 text-xs mb-2">选择颜色</div>
                  <div className="flex flex-wrap gap-1">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewDept({ ...newDept, color })}
                        className={`w-6 h-6 rounded-full transition-all ${
                          newDept.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e2936] scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  className="w-full bg-[#1e2936] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3D7FFF]"
                  placeholder="部门描述（可选）"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={!newDept.name.trim()}
                    className="flex-1 py-2 rounded-lg bg-[#3D7FFF] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    确认添加
                  </button>
                  <button
                    onClick={() => { setIsAdding(false); setNewDept({ name: '', icon: '💼', color: '#3D7FFF', description: '' }); }}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white/70 text-sm"
                  >
                    取消
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部添加按钮 */}
        {!isAdding && (
          <div className="p-4 border-t border-white/10">
            <motion.button
              className="w-full py-3 rounded-xl bg-[#3D7FFF]/20 text-[#3D7FFF] font-medium flex items-center justify-center gap-2"
              whileHover={{ backgroundColor: 'rgba(61, 127, 255, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-5 h-5" />
              添加新部门
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
