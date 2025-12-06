import { Layout, Menu, Avatar, Dropdown, Typography, Button } from 'antd'
import { 
  DashboardOutlined, 
  TeamOutlined, 
  ThunderboltOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MainLayoutProps {
  children?: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '驾驶舱',
    },
    {
      key: '/company',
      icon: <UserOutlined />,
      label: '公司管理',
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: '员工管理',
    },
    {
      key: '/skillcards',
      icon: <ThunderboltOutlined />,
      label: '技能卡',
    },
    {
      key: '/tasks',
      icon: <FileTextOutlined />,
      label: '任务中心',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout()
      navigate('/login')
    } else if (key === 'profile') {
      navigate('/profile')
    }
  }

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏 */}
      <Sider
        theme="light"
        className="shadow-md"
        width={220}
      >
        <div className="h-16 flex items-center justify-center border-b">
          <Text strong className="text-xl text-primary">无限公司</Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="border-r-0"
        />
      </Sider>

      <Layout>
        {/* 顶部栏 */}
        <Header className="bg-white px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Text type="secondary">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </Text>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 秘书按钮 */}
            <Button 
              type="primary" 
              icon={<MessageOutlined />}
              onClick={() => {/* TODO: 打开秘书对话 */}}
            >
              秘书
            </Button>
            
            {/* 用户头像菜单 */}
            <Dropdown 
              menu={{ 
                items: userMenuItems, 
                onClick: handleUserMenuClick 
              }}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1 rounded">
                <Avatar 
                  src={user?.avatar_url} 
                  icon={<UserOutlined />}
                  className="bg-primary"
                />
                <Text>{user?.nickname || 'CEO'}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* 主内容区 */}
        <Content className="bg-gray-50 p-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
