import { useEffect, useState } from 'react'
import { Typography, Row, Col, Card, Statistic, Empty, Layout, List, Avatar, Tag, Spin } from 'antd'
import {
  TeamOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  RocketOutlined
} from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/components/common/MainLayout'
import { employeeApi, taskApi, skillcardApi } from '@/api'
import type { Employee, Task, SkillCard } from '@/types'

const { Title } = Typography
const { Content } = Layout

// 员工状态标签映射
const employeeStatusMap: Record<string, { color: string; text: string }> = {
  idle: { color: 'green', text: '空闲' },
  working: { color: 'blue', text: '工作中' },
  offline: { color: 'default', text: '离线' },
  error: { color: 'red', text: '异常' },
}

// 任务状态标签映射
const taskStatusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '待处理' },
  running: { color: 'processing', text: '进行中' },
  paused: { color: 'warning', text: '已暂停' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '失败' },
  cancelled: { color: 'default', text: '已取消' },
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [skillCards, setSkillCards] = useState<SkillCard[]>([])

  // 统计数据
  const stats = {
    totalEmployees: employees.length,
    totalSkillCards: skillCards.length,
    runningTasks: tasks.filter(t => t.status === 'running').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [employeesRes, tasksRes, skillCardsRes] = await Promise.all([
        employeeApi.listEmployees(),
        taskApi.listTasks(''),
        skillcardApi.listSkillCards(),
      ])

      if (employeesRes.code === 0) {
        setEmployees(employeesRes.data || [])
      }
      if (tasksRes.code === 0) {
        setTasks(tasksRes.data || [])
      }
      if (skillCardsRes.code === 0) {
        setSkillCards(skillCardsRes.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取最近5条任务
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

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
        <Spin spinning={loading}>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="AI员工"
                  value={stats.totalEmployees}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="技能卡"
                  value={stats.totalSkillCards}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="进行中任务"
                  value={stats.runningTasks}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic
                  title="已完成任务"
                  value={stats.completedTasks}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 员工状态区域 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="员工状态" className="min-h-80">
                {employees.length === 0 ? (
                  <Empty 
                    description="还没有招募任何员工"
                    className="mt-12"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <List
                    dataSource={employees}
                    renderItem={(employee) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              src={employee.avatar_url} 
                              icon={<UserOutlined />}
                              className="bg-blue-500"
                            />
                          }
                          title={employee.name}
                          description={employee.role || '未设置职位'}
                        />
                        <Tag color={employeeStatusMap[employee.status]?.color || 'default'}>
                          {employeeStatusMap[employee.status]?.text || employee.status}
                        </Tag>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="最近任务" className="min-h-80">
                {recentTasks.length === 0 ? (
                  <Empty 
                    description="暂无任务"
                    className="mt-12"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <List
                    size="small"
                    dataSource={recentTasks}
                    renderItem={(task) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<RocketOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                          title={task.title}
                          description={
                            <Tag color={taskStatusMap[task.status]?.color || 'default'}>
                              {taskStatusMap[task.status]?.text || task.status}
                            </Tag>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Spin>
      </Content>
    </MainLayout>
  )
}
