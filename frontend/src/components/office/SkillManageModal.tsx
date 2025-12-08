import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { useState, useEffect, DragEvent } from 'react';
import * as employeeApi from '../../api/employee';
import * as skillCardApi from '../../api/skillcard';
import { message, Spin, Modal, Input, Form, Select } from 'antd';
import type { SkillCard } from '../../types';
import { SkillCardWorkshop } from './SkillCardWorkshop';

// 扩展的员工类型（包含装备的技能ID）
interface EmployeeWithSkill {
  id: string;
  name: string;
  role: string;
  status: string;
  skills: string[];
  performance: number;
  avatarColor: string;
  position: { x: number; y: number };
  departmentId: string;
  equippedSkillId?: string;
}

interface SkillManageModalProps {
  onClose: () => void;
}

export function SkillManageModal({ onClose }: SkillManageModalProps) {
  const [employees, setEmployees] = useState<EmployeeWithSkill[]>([]);
  const [skillCards, setSkillCards] = useState<SkillCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedSkill, setDraggedSkill] = useState<SkillCard | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [workshopVisible, setWorkshopVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, skillRes] = await Promise.all([
        employeeApi.listEmployees(),
        skillCardApi.listSkillCards()
      ]);
      
      if (empRes.code === 0 && empRes.data) {
        const mappedEmployees = empRes.data.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          role: emp.role || 'developer',
          status: emp.status || 'idle',
          skills: emp.skills || [],
          performance: emp.performance || 80,
          avatarColor: emp.avatar_url || '#3D7FFF',
          position: { x: 0, y: 0 },
          departmentId: emp.department_id || 'dept-1',
          equippedSkillId: emp.skill_card_id,
        }));
        setEmployees(mappedEmployees);
      }
      
      if (skillRes.code === 0 && skillRes.data) {
        // 处理后端sql.NullString类型（返回 {String: "xxx", Valid: true} 格式）
        const processedSkills = skillRes.data.map((skill: any) => ({
          ...skill,
          // 处理sql.NullString类型字段
          description: typeof skill.description === 'object' && skill.description !== null
            ? (skill.description.Valid ? skill.description.String : '')
            : (skill.description || ''),
          icon: typeof skill.icon === 'object' && skill.icon !== null
            ? (skill.icon.Valid ? skill.icon.String : '')
            : (skill.icon || ''),
          version: typeof skill.version === 'object' && skill.version !== null
            ? (skill.version.Valid ? skill.version.String : '')
            : (skill.version || ''),
        }));
        setSkillCards(processedSkills);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'developer': return '💻';
      case 'designer': return '🎨';
      case 'marketer': return '📢';
      case 'analyst': return '📊';
      default: return '👤';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'creative': return '#FF6B9D';
      case 'content': return '#4ECDC4';
      case 'visual': return '#FFD93D';
      case 'optimize': return '#A8E6CF';
      case 'publish': return '#3D7FFF';
      default: return '#888';
    }
  };

  const getCategoryText = (category?: string) => {
    switch (category) {
      case 'creative': return '创意策略';
      case 'collection': return '素材获取';
      case 'content': return '内容创作';
      case 'visual': return '视觉设计';
      case 'optimize': return '优化质检';
      case 'publish': return '发布运营';
      case 'delivery': return '合成交付';
      default: return '通用';
    }
  };

  // 拖拽事件处理
  const handleDragStart = (e: DragEvent, skill: SkillCard) => {
    setDraggedSkill(skill);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedSkill(null);
    setDropTargetId(null);
  };

  const handleDragOver = (e: DragEvent, employeeId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDropTargetId(employeeId);
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDrop = async (e: DragEvent, employee: EmployeeWithSkill) => {
    e.preventDefault();
    setDropTargetId(null);
    
    if (!draggedSkill) return;
    
    try {
      await employeeApi.assignSkill(employee.id, { skill_card_id: draggedSkill.id });
      message.success(`已为 ${employee.name} 装备技能「${draggedSkill.name}」`);
      // 刷新数据
      loadData();
    } catch (error) {
      console.error('Failed to assign skill:', error);
      message.error('装备技能失败');
    }
    
    setDraggedSkill(null);
  };

  // 创建技能
  const handleCreateSkill = async (values: any) => {
    try {
      await skillCardApi.createSkillCard(values);
      message.success('技能创建成功');
      setCreateModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      console.error('Failed to create skill:', error);
      message.error('创建技能失败');
    }
  };

  // 删除技能
  const handleDeleteSkill = async (skillId: string, skillName: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除技能「${skillName}」吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await skillCardApi.deleteSkillCard(skillId);
          message.success('技能已删除');
          loadData();
        } catch (error) {
          console.error('Failed to delete skill:', error);
          message.error('删除技能失败');
        }
      }
    });
  };

  // 查找员工装备的技能
  const getEquippedSkill = (employee: EmployeeWithSkill) => {
    if (!employee.equippedSkillId) return null;
    return skillCards.find(s => s.id === employee.equippedSkillId);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="w-[95vw] h-[90vh] max-w-6xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-white text-xl font-bold">技能管理面板</h2>
                <p className="text-slate-400 text-sm mt-0.5">拖拽技能卡到员工身上进行装备</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 内容区域 */}
          <Spin spinning={loading}>
            <div className="flex-1 overflow-hidden flex gap-6 p-6">
              {/* 左侧：员工区 */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                  <h3 className="text-white font-medium">员工区</h3>
                  <span className="text-white/40 text-sm">({employees.length})</span>
                </div>

                {employees.length === 0 ? (
                  <div className="text-center py-12 text-white/50">
                    暂无员工
                  </div>
                ) : (
                  employees.map((employee, index) => {
                    const equippedSkill = getEquippedSkill(employee);
                    return (
                      <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onDragOver={(e) => handleDragOver(e as any, employee.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e as any, employee)}
                        className={`p-4 rounded-xl cursor-drop transition-all ${
                          dropTargetId === employee.id
                            ? 'ring-2 ring-green-400 bg-green-900/20'
                            : 'bg-slate-800/50 border border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: employee.avatarColor + '33' }}
                          >
                            {getRoleIcon(employee.role)}
                          </div>

                          <div className="flex-1">
                            <div className="text-white font-medium">{employee.name}</div>
                            {equippedSkill ? (
                              <div className="text-sm text-green-400 flex items-center gap-1 mt-0.5">
                                <Check className="w-3 h-3" />
                                已装备：{equippedSkill.name}
                              </div>
                            ) : (
                              <div className="text-sm text-slate-400 mt-0.5">待装备</div>
                            )}
                          </div>

                          {equippedSkill && (
                            <div
                              className="px-3 py-1 rounded-lg text-xs font-medium"
                              style={{
                                backgroundColor: getCategoryColor(equippedSkill.category) + '22',
                                color: getCategoryColor(equippedSkill.category),
                              }}
                            >
                              {getCategoryText(equippedSkill.category)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* 右侧：技能区 */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h3 className="text-white font-medium">技能卡</h3>
                    <span className="text-white/40 text-sm">({skillCards.length})</span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCreateModalVisible(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      简单创建
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWorkshopVisible(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm hover:bg-yellow-500/30 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      高级工坊
                    </motion.button>
                  </div>
                </div>

                {skillCards.length === 0 ? (
                  <div className="text-center py-12 text-white/50">
                    暂无技能卡，点击上方按钮创建
                  </div>
                ) : (
                  skillCards.map((skill, index) => {
                    const color = getCategoryColor(skill.category);
                    
                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, skill)}
                        onDragEnd={handleDragEnd}
                        className={`p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] ${
                          draggedSkill?.id === skill.id ? 'opacity-50' : ''
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                          border: `1px solid ${color}33`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* 拖拽手柄 */}
                          <div className="text-white/30 hover:text-white/60 transition-colors">
                            <GripVertical className="w-5 h-5" />
                          </div>

                          {/* 技能图标 */}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${color}22` }}
                          >
                            ⚡
                          </div>

                          {/* 信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">{skill.name}</div>
                            <div className="text-sm mt-0.5" style={{ color }}>
                              {getCategoryText(skill.category)}
                            </div>
                          </div>

                          {/* 删除按钮 */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSkill(skill.id, skill.name);
                            }}
                            className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                        
                        {skill.description && (
                          <p className="text-white/50 text-sm mt-2 ml-8 line-clamp-2">
                            {skill.description}
                          </p>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </Spin>

          {/* 技能卡工坊 */}
          <AnimatePresence>
            {workshopVisible && (
              <SkillCardWorkshop
                onClose={() => setWorkshopVisible(false)}
                onSuccess={() => {
                  loadData();
                  setWorkshopVisible(false);
                }}
              />
            )}
          </AnimatePresence>

          {/* 简单创建技能弹窗 */}
          <Modal
            title="快速创建技能卡"
            open={createModalVisible}
            onCancel={() => {
              setCreateModalVisible(false);
              form.resetFields();
            }}
            onOk={() => form.submit()}
            okText="创建"
            cancelText="取消"
          >
            <Form form={form} layout="vertical" onFinish={handleCreateSkill}>
              <Form.Item
                name="name"
                label="技能名称"
                rules={[{ required: true, message: '请输入技能名称' }]}
              >
                <Input placeholder="例如：小红书笔记生成器" />
              </Form.Item>
              <Form.Item
                name="category"
                label="技能分类"
                rules={[{ required: true, message: '请选择技能分类' }]}
              >
                <Select placeholder="选择分类">
                  <Select.Option value="creative">创意策略</Select.Option>
                  <Select.Option value="collection">素材获取</Select.Option>
                  <Select.Option value="content">内容创作</Select.Option>
                  <Select.Option value="visual">视觉设计</Select.Option>
                  <Select.Option value="optimize">优化质检</Select.Option>
                  <Select.Option value="publish">发布运营</Select.Option>
                  <Select.Option value="delivery">合成交付</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="description" label="技能描述">
                <Input.TextArea rows={3} placeholder="描述这个技能的功能和用途" />
              </Form.Item>
            </Form>
          </Modal>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
