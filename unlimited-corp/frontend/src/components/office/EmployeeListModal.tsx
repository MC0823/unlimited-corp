import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Employee } from '../../types/office';
import * as employeeApi from '../../api/employee';
import { message, Spin } from 'antd';

interface EmployeeListModalProps {
  onClose: () => void;
  onEmployeeClick: (employee: Employee) => void;
}

export function EmployeeListModal({ onClose, onEmployeeClick }: EmployeeListModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
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
          description: emp.description,
          equippedSkill: emp.skill_card_id,
        }));
        setEmployees(mappedEmployees);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      message.error('加载员工列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'developer': return '💻';
      case 'designer': return '🎨';
      case 'marketer': return '📢';
      case 'analyst': return '📊';
      default: return '👤';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'developer': return '开发工程师';
      case 'designer': return '设计师';
      case 'marketer': return '市场专员';
      case 'analyst': return '数据分析师';
      default: return '员工';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return '#4ECDC4';
      case 'idle': return '#A8E6CF';
      case 'tired': return '#FFD93D';
      default: return '#888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working': return '工作中';
      case 'idle': return '空闲';
      case 'tired': return '疲惫';
      default: return '未知';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          className="relative rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(42, 63, 95, 0.95) 0%, rgba(30, 45, 66, 0.98) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 60px rgba(255, 107, 157, 0.15), 0 25px 50px rgba(0,0,0,0.5)',
          }}
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* 顶部彩色边框 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B9D] to-transparent" />
          
          {/* 玻璃态光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
          
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 border border-white/10 office-btn"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          <div className="p-8 relative z-10 flex flex-col h-full max-h-[80vh]">
            {/* 标题 */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B9D]/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#FF6B9D]" />
              </div>
              <div>
                <h2 className="text-white text-2xl font-semibold">员工列表</h2>
                <p className="text-white/50 text-sm">查看和管理您的团队成员</p>
              </div>
              <div className="ml-auto bg-[#FF6B9D]/20 px-4 py-2 rounded-xl border border-[#FF6B9D]/30">
                <span className="text-[#FF6B9D] font-medium">{employees.length} 名员工</span>
              </div>
            </div>

            {/* 搜索框 */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="搜索员工..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#FF6B9D]/50"
              />
            </div>

            {/* 员工列表 */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: 'calc(80vh - 220px)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Spin size="large" />
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-12 text-white/50">
                  {searchTerm ? '未找到匹配的员工' : '暂无员工数据'}
                </div>
              ) : (
                filteredEmployees.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => onEmployeeClick(employee)}
                    className="cursor-pointer p-4 rounded-xl overflow-hidden backdrop-blur-sm transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${employee.avatarColor}15, ${employee.avatarColor}08)`,
                      border: `1px solid ${employee.avatarColor}33`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* 头像 */}
                      <motion.div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-2 shadow-lg"
                        style={{
                          borderColor: employee.avatarColor,
                          backgroundColor: `${employee.avatarColor}22`,
                        }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {getRoleIcon(employee.role)}
                      </motion.div>

                      {/* 信息 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg text-white font-medium">{employee.name}</span>
                          <span className="text-sm text-white/50">· {getRoleText(employee.role)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getStatusColor(employee.status) }}
                            />
                            <span className="text-sm" style={{ color: getStatusColor(employee.status) }}>
                              {getStatusText(employee.status)}
                            </span>
                          </div>
                          {employee.skills && employee.skills.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-white/40 text-sm">技能:</span>
                              <span className="text-white/70 text-sm">{employee.skills.slice(0, 2).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 绩效指标 */}
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: employee.avatarColor }}>
                          {employee.performance}%
                        </div>
                        <div className="text-xs text-white/40">绩效</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
