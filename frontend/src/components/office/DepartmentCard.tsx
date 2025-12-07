import { motion } from 'framer-motion';
import { Settings, Users, Plus } from 'lucide-react';
import { Department, Employee } from '../../types/office';
import { QEmployee } from './QEmployee';

interface DepartmentCardProps {
  department: Department;
  employees: Employee[];
  onEmployeeClick: (employee: Employee) => void;
  onSettingsClick: () => void;
  onAddEmployee?: () => void;
  delay?: number;
}

export function DepartmentCard({
  department,
  employees,
  onEmployeeClick,
  onSettingsClick,
  onAddEmployee,
  delay = 0
}: DepartmentCardProps) {
  return (
    <motion.div
      className="bg-transparent rounded-2xl p-4 backdrop-blur-sm relative group min-w-[320px] flex-shrink-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* 部门头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 部门图标 */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
            style={{ backgroundColor: department.color }}
          >
            {department.icon}
          </div>
          
          {/* 部门名称和人数 */}
          <div>
            <h3 className="text-white font-semibold">{department.name}</h3>
            <div className="flex items-center gap-1 text-xs text-white/50">
              <Users className="w-3 h-3" />
              <span>{employees.length} 人</span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {onAddEmployee && (
            <motion.button
              className="w-7 h-7 rounded-lg bg-[#3D7FFF]/20 flex items-center justify-center text-[#3D7FFF] opacity-0 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(61, 127, 255, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onAddEmployee(); }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          )}
          <motion.button
            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onSettingsClick(); }}
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* 员工网格 */}
      {employees.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {employees.map((employee, index) => (
            <QEmployee
              key={employee.id}
              employee={employee}
              onClick={() => onEmployeeClick(employee)}
              size="sm"
              delay={delay + index * 0.05}
            />
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <div className="text-white/30 text-sm">暂无员工</div>
          {onAddEmployee && (
            <motion.button
              className="mt-2 px-4 py-2 rounded-lg bg-[#3D7FFF]/20 text-[#3D7FFF] text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddEmployee}
            >
              添加员工
            </motion.button>
          )}
        </div>
      )}

      {/* 部门描述 */}
      {department.description && (
        <div className="mt-3">
          <p className="text-xs text-white/40">{department.description}</p>
        </div>
      )}

      {/* 装饰性发光边框 */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          boxShadow: `inset 0 0 0 1px ${department.color}40, 0 0 20px ${department.color}20`
        }}
      />
    </motion.div>
  );
}
