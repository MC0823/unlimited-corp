import { useState } from 'react';
import { Office } from './components/Office';
import { EmployeeDetailModal } from './components/EmployeeDetailModal';
import { TaskBoardModal } from './components/TaskBoardModal';
import { SecretaryModal } from './components/SecretaryModal';
import { DataCenterModal } from './components/DataCenterModal';
import { MarketModal } from './components/MarketModal';
import { CommandInput } from './components/CommandInput';
import { Employee, Task } from './types';

type ModalType = 'tasks' | 'secretary' | 'data' | 'market' | null;

export default function App() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCommandInput, setShowCommandInput] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#2a3f5f] via-[#1a2332] to-[#0f1419] overflow-hidden relative">
      {/* 游戏场景主容器 */}
      <Office 
        onEmployeeClick={setSelectedEmployee}
        onTaskClick={() => setActiveModal('tasks')}
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
    </div>
  );
}
