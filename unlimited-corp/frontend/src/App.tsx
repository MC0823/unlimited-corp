import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CompanyPage from './pages/CompanyPage'
import EmployeePage from './pages/EmployeePage'
import SkillCardPage from './pages/SkillCardPage'
import OfficePage from './pages/OfficePage'
import TaskPage from './pages/TaskPage'
import WebSocketProvider from './components/common/WebSocketProvider'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
          } />
          
          {/* 演示路由 - 无需登录直接访问办公室 */}
          <Route path="/demo" element={<OfficePage />} />
          
          {/* 受保护路由 */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/office" replace /> : <Navigate to="/login" replace />
          } />
          <Route path="/office" element={
            isAuthenticated ? <OfficePage /> : <Navigate to="/login" replace />
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/company" element={
            isAuthenticated ? <CompanyPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/employees" element={
            isAuthenticated ? <EmployeePage /> : <Navigate to="/login" replace />
          } />
          <Route path="/skillcards" element={
            isAuthenticated ? <SkillCardPage /> : <Navigate to="/login" replace />
          } />
          <Route path="/tasks" element={
            isAuthenticated ? <TaskPage /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  )
}

export default App
