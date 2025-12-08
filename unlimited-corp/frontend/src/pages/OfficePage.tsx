import { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import { 
  Office, 
  EmployeeDetailModal, 
  MarketModal, 
  CommandInput,
  SecretaryWidget,
  DepartmentManageModal,
  EmployeeListModal,
  SkillManageModal
} from '../components/office';
import { Employee, ModalType, Department } from '../types/office';
import { DEFAULT_SECRETARIES } from '../constants/officeMockData';
import { employeeApi } from '../api';

export default function OfficePage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCommandInput, setShowCommandInput] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(true);
  
  // 部门数据 - 从API获取
  const [departments, setDepartments] = useState<Department[]>([]);
  // 员工数据 - 从API获取
  const [_employees, setEmployees] = useState<Employee[]>([]);

  // 初始化数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 获取员工列表
      const employeeRes = await employeeApi.listEmployees();
      if (employeeRes.code === 0 && employeeRes.data) {
        // 转换后端数据格式为前端格式
        const mappedEmployees = employeeRes.data.map((emp: any) => ({
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
        
        // 根据员工生成部门（临时方案，后续可添加部门API）
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
        // 如果没有部门，添加默认部门
        if (deptMap.size === 0) {
          deptMap.set('dept-1', { id: 'dept-1', name: '技术部', icon: '💻', color: '#3D7FFF' });
        }
        setDepartments(Array.from(deptMap.values()));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 根据部门ID获取部门名称
  const getDeptName = (id: string) => {
    const names: Record<string, string> = {
      'dept-1': '技术部', 'dept-2': '设计部', 'dept-3': '市场部', 'dept-4': '数据部'
    };
    return names[id] || '未分配部门';
  };
  const getDeptIcon = (id: string) => {
    const icons: Record<string, string> = {
      'dept-1': '💻', 'dept-2': '🎨', 'dept-3': '📢', 'dept-4': '📊'
    };
    return icons[id] || '💼';
  };
  const getDeptColor = (id: string) => {
    const colors: Record<string, string> = {
      'dept-1': '#3D7FFF', 'dept-2': '#FF6B9D', 'dept-3': '#FFB800', 'dept-4': '#4ECDC4'
    };
    return colors[id] || '#3D7FFF';
  };

  // 部门操作
  const handleAddDepartment = async (dept: Omit<Department, 'id'>) => {
    const newDept = { ...dept, id: `dept-${Date.now()}` };
    setDepartments([...departments, newDept]);
    message.success('部门创建成功');
  };
  const handleUpdateDepartment = async (dept: Department) => {
    setDepartments(departments.map(d => d.id === dept.id ? dept : d));
    message.success('部门更新成功');
  };
  const handleDeleteDepartment = async (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    message.success('部门删除成功');
  };

  // 秘书数据
  const secretaries = DEFAULT_SECRETARIES;

  // 加载中显示
  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-[#2a3f5f] via-[#1a2332] to-[#0f1419] flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#2a3f5f] via-[#1a2332] to-[#0f1419] overflow-hidden relative">
      {/* 游戏场景主容器 */}
      <Office 
        onEmployeeClick={setSelectedEmployee}
        onCommandClick={() => setShowCommandInput(true)}
        onModalOpen={setActiveModal}
      />

      {/* 员工详情弹窗 */}
      {selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {/* 部门管理弹窗 */}
      {activeModal === 'department' && (
        <DepartmentManageModal 
          departments={departments}
          onClose={() => setActiveModal(null)}
          onAdd={handleAddDepartment}
          onUpdate={handleUpdateDepartment}
          onDelete={handleDeleteDepartment}
        />
      )}

      {/* 员工列表弹窗 */}
      {activeModal === 'employee' && (
        <EmployeeListModal 
          onClose={() => setActiveModal(null)} 
          onEmployeeClick={(emp: Employee) => {
            setActiveModal(null);
            setSelectedEmployee(emp);
          }}
        />
      )}

      {/* 技能管理弹窗 */}
      {activeModal === 'skill' && (
        <SkillManageModal onClose={() => setActiveModal(null)} />
      )}

      {/* 市场弹窗 */}
      {activeModal === 'market' && (
        <MarketModal onClose={() => setActiveModal(null)} />
      )}

      {/* 指令输入窗口 */}
      {showCommandInput && (
        <CommandInput onClose={() => setShowCommandInput(false)} />
      )}

      {/* 秘书助理 - 右下角 */}
      <SecretaryWidget 
        secretaries={secretaries}
        onSecretaryClick={() => setActiveModal('employee')}
      />
    </div>
  );
}
