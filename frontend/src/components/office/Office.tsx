import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { message } from 'antd';

import { DepartmentCard } from './DepartmentCard';
import { DepartmentManageModal } from './DepartmentManageModal';
import { TopBar } from './TopBar';
import { BottomButtonBar } from './BottomButtonBar';
import { Employee, Task, Secretary, ModalType, Department } from '../../types/office';
import { DEFAULT_SECRETARIES, DEFAULT_TASKS } from '../../constants/officeMockData';
import { employeeApi } from '../../api';

interface OfficeProps {
  onEmployeeClick: (employee: Employee) => void;
  onCommandClick: () => void;
  onModalOpen: (modal: Exclude<ModalType, null>) => void;
}

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
  onAddDepartment: _onAddDepartment
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


      </motion.div>
    </div>
  );
}

export function Office({ onEmployeeClick, onCommandClick, onModalOpen }: OfficeProps) {
  // 部门和员工数据 - 从API获取
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showDeptManage, setShowDeptManage] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await employeeApi.listEmployees();
      if (res.code === 0 && res.data) {
        // 转换后端数据格式
        const mappedEmployees = res.data.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          role: emp.role || 'developer',
          status: emp.status || 'idle',
          skills: emp.skills || [],
          performance: emp.performance || 80,
          avatarColor: emp.avatar_url || '#3D7FFF',
          position: { x: 0, y: 0 },
          departmentId: emp.department_id || 'dept-1',
        }));
        setEmployees(mappedEmployees);
        
        // 根据员工生成部门
        const deptMap = new Map<string, Department>();
        mappedEmployees.forEach((emp: Employee) => {
          if (!deptMap.has(emp.departmentId)) {
            deptMap.set(emp.departmentId, {
              id: emp.departmentId,
              name: getDeptName(emp.departmentId),
              icon: getDeptIcon(emp.departmentId),
              color: getDeptColor(emp.departmentId),
            });
          }
        });
        if (deptMap.size === 0) {
          deptMap.set('dept-1', { id: 'dept-1', name: '技术部', icon: '💻', color: '#3D7FFF' });
          deptMap.set('dept-2', { id: 'dept-2', name: '设计部', icon: '🎨', color: '#FF6B9D' });
        }
        setDepartments(Array.from(deptMap.values()));
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      // 如果加载失败，显示默认部门
      setDepartments([
        { id: 'dept-1', name: '技术部', icon: '💻', color: '#3D7FFF' },
        { id: 'dept-2', name: '设计部', icon: '🎨', color: '#FF6B9D' },
      ]);
    } finally {
    }
  };

  // 部门名称、图标、颜色映射
  const getDeptName = (id: string) => {
    const names: Record<string, string> = { 'dept-1': '技术部', 'dept-2': '设计部', 'dept-3': '市场部', 'dept-4': '数据部' };
    return names[id] || '未分配';
  };
  const getDeptIcon = (id: string) => {
    const icons: Record<string, string> = { 'dept-1': '💻', 'dept-2': '🎨', 'dept-3': '📢', 'dept-4': '📊' };
    return icons[id] || '💼';
  };
  const getDeptColor = (id: string) => {
    const colors: Record<string, string> = { 'dept-1': '#3D7FFF', 'dept-2': '#FF6B9D', 'dept-3': '#FFB800', 'dept-4': '#4ECDC4' };
    return colors[id] || '#3D7FFF';
  };

  // 部门管理操作
  const handleAddDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept = { ...dept, id: `dept-${Date.now()}` };
    setDepartments(prev => [...prev, newDept]);
    message.success('部门创建成功');
  };

  const handleUpdateDepartment = (dept: Department) => {
    setDepartments(prev => prev.map(d => d.id === dept.id ? dept : d));
    message.success('部门更新成功');
  };

  const handleDeleteDepartment = (deptId: string) => {
    setDepartments(prev => prev.filter(d => d.id !== deptId));
    message.success('部门删除成功');
  };

  // 按部门获取员工
  const getEmployeesByDept = (deptId: string) => 
    employees.filter(e => e.departmentId === deptId);

  // 任务和秘书数据
  const [tasks] = useState<Task[]>(DEFAULT_TASKS);
  const [secretaries] = useState<Secretary[]>(DEFAULT_SECRETARIES);

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
      <TopBar onDataCenterClick={() => onModalOpen('skill')} />

      {/* 中央场景区域 - 部门分区 */}
      <div className="flex-1 relative overflow-hidden">
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
        onDepartmentClick={() => setShowDeptManage(true)}
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
