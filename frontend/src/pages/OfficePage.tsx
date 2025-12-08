import { useState } from 'react';
import { 
  Office, 
  EmployeeDetailModal, 
  TaskBoardModal, 
  SecretaryModal, 
  DataCenterModal, 
  MarketModal, 
  CommandInput,
  SecretaryWidget
} from '../components/office';
import { Employee, ModalType } from '../types/office';

export default function OfficePage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCommandInput, setShowCommandInput] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // 秘书数据
  const secretaries = [
    { id: 's1', name: '商务秘书 Linda', type: 'business' as const, avatar: '📊', status: '已准备3份报告' },
    { id: 's2', name: '生活秘书 Sophia', type: 'life' as const, avatar: '☕', status: '今日行程已安排' },
    { id: 's3', name: '私人秘书 Grace', type: 'personal' as const, avatar: '🎧', status: '待处理消息 5 条' },
  ];

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

      {/* 任务中心弹窗 */}
      {activeModal === 'tasks' && (
        <TaskBoardModal onClose={() => setActiveModal(null)} />
      )}

      {/* 秘书处弹窗 */}
      {activeModal === 'secretary' && (
        <SecretaryModal onClose={() => setActiveModal(null)} />
      )}

      {/* 数据中心弹窗 */}
      {activeModal === 'data' && (
        <DataCenterModal onClose={() => setActiveModal(null)} />
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
        onSecretaryClick={() => setActiveModal('secretary')}
      />
    </div>
  );
}
