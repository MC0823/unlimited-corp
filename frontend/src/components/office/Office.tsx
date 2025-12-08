import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Plus, Building2 } from 'lucide-react';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentManageModal } from './DepartmentManageModal';
import { TopBar } from './TopBar';
import { BottomButtonBar } from './BottomButtonBar';
import { Employee, Task, Secretary, ModalType, Department } from '../../types/office';

interface OfficeProps {
  onEmployeeClick: (employee: Employee) => void;
  onCommandClick: () => void;
  onModalOpen: (modal: Exclude<ModalType, null>) => void;
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 水平拖拽容器组件
interface HorizontalDragContainerProps {
  departments: Department[];
  getEmployeesByDept: (deptId: string) => Employee[];
  onEmployeeClick: (employee: Employee) => void;
  onSettingsClick: () => void;
  onAddDepartment: () => void;
}

function HorizontalDragContainer({
  departments,
  getEmployeesByDept,
  onEmployeeClick,
  onSettingsClick,
  onAddDepartment
}: HorizontalDragContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, scrollX: 0 });

  // 计算最大滚动范围
  const getMaxScroll = () => {
    if (!wrapperRef.current || !contentRef.current) return 0;
    const wrapperWidth = wrapperRef.current.clientWidth;
    const contentWidth = contentRef.current.scrollWidth;
    return Math.max(0, contentWidth - wrapperWidth + 64); // 64px for padding
  };

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      scrollX: x.get()
    });
  };

  // 处理拖拽移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStart.x;
    const maxScroll = getMaxScroll();
    
    let newX = dragStart.scrollX + diff;
    newX = Math.max(-maxScroll, Math.min(0, newX));
    x.set(newX);
  };

  // 处理拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理鼠标离开
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // 处理滚轮横向滚动
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const maxScroll = getMaxScroll();
    
    let newX = x.get() - e.deltaY;
    newX = Math.max(-maxScroll, Math.min(0, newX));
    
    animate(x, newX, { type: 'spring', stiffness: 300, damping: 30 });
  };

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 pt-20 pb-4 overflow-hidden cursor-grab active:cursor-grabbing flex items-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      style={{ userSelect: isDragging ? 'none' : 'auto' }}
    >
      <motion.div
        ref={contentRef}
        className="flex gap-6 px-8"
        style={{ x }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {departments.map((dept, index) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            employees={getEmployeesByDept(dept.id)}
            onEmployeeClick={onEmployeeClick}
            onSettingsClick={onSettingsClick}
            delay={index * 0.1}
          />
        ))}

        {/* 添加部门卡片 */}
        <motion.div
          className="min-w-[280px] flex-shrink-0 rounded-2xl p-8 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-[#3D7FFF]/50 hover:bg-[#3D7FFF]/5 transition-all h-[200px]"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: departments.length * 0.1 }}
          whileHover={{ scale: 1.02 }}
          onClick={(e) => { e.stopPropagation(); onAddDepartment(); }}
        >
          <Plus className="w-10 h-10 text-white/20 mb-3" />
          <span className="text-white/40 text-sm">添加新部门</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Office({ onEmployeeClick, onCommandClick, onModalOpen }: OfficeProps) {
  // 部门数据
  const [departments, setDepartments] = useState<Department[]>([
    { id: 'dept-1', name: '技术部', icon: '💻', color: '#3D7FFF', description: '负责产品研发与技术支持' },
    { id: 'dept-2', name: '设计部', icon: '🎨', color: '#FF6B9D', description: '负责UI/UX设计与品牌视觉' },
    { id: 'dept-3', name: '市场部', icon: '📢', color: '#FFD93D', description: '负责市场推广与运营' },
    { id: 'dept-4', name: '数据部', icon: '📊', color: '#4ECDC4', description: '负责数据分析与决策支持' },
  ]);

  const [showDeptManage, setShowDeptManage] = useState(false);

  // 员工数据 - 关联部门
  const [employees] = useState<Employee[]>([
    { id: '1', name: 'Alice Chen', role: 'developer', status: 'working', skills: ['React', 'TypeScript'], performance: 92, currentTask: 'task-1', avatarColor: '#FF6B9D', position: { x: 25, y: 40 }, departmentId: 'dept-1' },
    { id: '2', name: 'Bob Liu', role: 'designer', status: 'idle', skills: ['UI/UX', 'Figma'], performance: 88, avatarColor: '#4ECDC4', position: { x: 40, y: 40 }, departmentId: 'dept-2' },
    { id: '3', name: 'Carol Wang', role: 'marketer', status: 'working', skills: ['SEO', 'Content'], performance: 85, currentTask: 'task-2', avatarColor: '#FFD93D', position: { x: 55, y: 40 }, departmentId: 'dept-3' },
    { id: '4', name: 'David Zhang', role: 'analyst', status: 'tired', skills: ['Data', 'SQL'], performance: 90, avatarColor: '#A8E6CF', position: { x: 70, y: 40 }, departmentId: 'dept-4' },
    { id: '5', name: 'Emma Li', role: 'developer', status: 'working', skills: ['Python', 'AI'], performance: 94, currentTask: 'task-3', avatarColor: '#C7CEEA', position: { x: 25, y: 55 }, departmentId: 'dept-1' },
    { id: '6', name: 'Frank Wu', role: 'designer', status: 'idle', skills: ['Branding', 'Animation'], performance: 87, avatarColor: '#FFDAB9', position: { x: 40, y: 55 }, departmentId: 'dept-2' },
  ]);

  // 部门管理操作
  const handleAddDepartment = (dept: Omit<Department, 'id'>) => {
    setDepartments(prev => [...prev, { ...dept, id: `dept-${generateId()}` }]);
  };

  const handleUpdateDepartment = (dept: Department) => {
    setDepartments(prev => prev.map(d => d.id === dept.id ? dept : d));
  };

  const handleDeleteDepartment = (deptId: string) => {
    setDepartments(prev => prev.filter(d => d.id !== deptId));
  };

  // 按部门获取员工
  const getEmployeesByDept = (deptId: string) => 
    employees.filter(e => e.departmentId === deptId);

  // 模拟任务数据
  const [tasks] = useState<Task[]>([
    { id: 'task-1', title: '开发新功能模块', status: 'in-progress', assignee: '1', priority: 'high', progress: 65, description: '实现用户管理系统的核心功能' },
    { id: 'task-2', title: '市场推广方案', status: 'in-progress', assignee: '3', priority: 'medium', progress: 40, description: '制定Q4季度营销策略' },
    { id: 'task-3', title: 'AI模型优化', status: 'in-progress', assignee: '5', priority: 'high', progress: 78, description: '提升模型准确率到95%以上' },
    { id: 'task-4', title: '界面设计优化', status: 'pending', priority: 'low', progress: 0, description: '重新设计产品主页面' },
    { id: 'task-5', title: '数据分析报告', status: 'completed', priority: 'medium', progress: 100, description: '生成月度运营数据报告' },
  ]);

  // 模拟秘书数据
  const [secretaries] = useState<Secretary[]>([
    { id: 's1', name: '商务秘书 Linda', type: 'business', avatar: '📊', status: '已准备3份报告' },
    { id: 's2', name: '生活秘书 Sophia', type: 'life', avatar: '☕', status: '今日行程已安排' },
    { id: 's3', name: '私人秘书 Grace', type: 'personal', avatar: '🎧', status: '待处理消息 5 条' },
  ]);

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* 网格背景 - 增强等距感 */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(45deg, #3D7FFF 1px, transparent 1px),
          linear-gradient(-45deg, #3D7FFF 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* 顶部状态栏 */}
      <TopBar />

      {/* 中央场景区域 - 部门分区 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 部门管理头部 */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#4ECDC4] animate-pulse" />
            <h2 className="text-white/90 text-lg font-medium">员工工作区 Employee Workspace</h2>
            <span className="text-white/40 text-sm">({departments.length} 个部门)</span>
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3D7FFF]/20 text-[#3D7FFF] text-sm font-medium backdrop-blur-sm"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(61, 127, 255, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeptManage(true)}
          >
            <Building2 className="w-4 h-4" />
            管理部门
          </motion.button>
        </div>

        {/* 水平拖拽容器 */}
        <HorizontalDragContainer
          departments={departments}
          getEmployeesByDept={getEmployeesByDept}
          onEmployeeClick={onEmployeeClick}
          onSettingsClick={() => setShowDeptManage(true)}
          onAddDepartment={() => setShowDeptManage(true)}
        />

        {/* 装饰性元素 - 飘动的粒子 */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#3D7FFF]/30 rounded-full pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 底部按钮栏 */}
      <BottomButtonBar 
        onCommandClick={onCommandClick}
        tasks={tasks}
        secretaries={secretaries}
        onModalOpen={onModalOpen}
      />

      {/* 部门管理弹窗 */}
      {showDeptManage && (
        <DepartmentManageModal
          departments={departments}
          onClose={() => setShowDeptManage(false)}
          onAdd={handleAddDepartment}
          onUpdate={handleUpdateDepartment}
          onDelete={handleDeleteDepartment}
        />
      )}
    </div>
  );
}
