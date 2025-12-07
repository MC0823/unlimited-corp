import { Typography, Row, Col, Card, Statistic, Empty, Layout } from 'antd'
import {
  TeamOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/components/common/MainLayout'

const { Title } = Typography
const { Content } = Layout

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <MainLayout>
      <Content>
      {/* 欢迎区域 */}
      <div className="mb-6">
        <Title level={3}>
          欢迎回来，{user?.nickname || 'CEO'}！
        </Title>
        <p className="text-gray-500">这是您的公司驾驶舱，在这里掌控全局。</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="AI员工"
              value={0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="技能卡"
              value={3}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="/ 系统预置"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中任务"
              value={0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成任务"
              value={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 员工状态区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="员工状态" className="h-80">
            <Empty 
              description="还没有招募任何员工"
              className="mt-12"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="最近任务" className="h-80">
            <Empty 
              description="暂无任务"
              className="mt-12"
            />
          </Card>
        </Col>
      </Row>
      </Content>
    </MainLayout>
  )
}
