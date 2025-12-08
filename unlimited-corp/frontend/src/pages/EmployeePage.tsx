import { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, Layout, TableColumnsType, Tag, Avatar, Select, Drawer, Descriptions, Progress, List, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SettingOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { employeeApi, skillcardApi } from '@/api'
import type { Employee, SkillCard } from '@/types'
import type { CreateEmployeeParams, UpdateEmployeeParams } from '@/api/employee'
import MainLayout from '@/components/common/MainLayout'

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

// 员工状态映射
const statusMap: Record<string, { color: string; text: string }> = {
  idle: { color: 'green', text: '空闲' },
  working: { color: 'blue', text: '工作中' },
  offline: { color: 'default', text: '离线' },
  error: { color: 'red', text: '异常' },
}

const { Content } = Layout
const { TextArea } = Input

export default function EmployeePage() {
  const [form] = Form.useForm()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [skillCards, setSkillCards] = useState<SkillCard[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [skillModalVisible, setSkillModalVisible] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])

  useEffect(() => {
    fetchEmployees()
    fetchSkillCards()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await employeeApi.listEmployees()
      if (response.code === 0 || response.code === 200) {
        setEmployees(response.data || [])
      }
    } catch (_err) {
      message.error('获取员工列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchSkillCards = async () => {
    try {
      const response = await skillcardApi.listSkillCards()
      if (response.code === 0 || response.code === 200) {
        setSkillCards(response.data || [])
      }
    } catch (_err) {
      console.error('获取技能卡失败')
    }
  }

  const handleCreate = () => {
    setEditingEmployee(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    form.setFieldsValue({
      name: employee.name,
      description: employee.role,
      avatar_url: employee.avatar_url,
    })
    setModalVisible(true)
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDrawerVisible(true)
  }

  const handleAssignSkill = (employee: Employee) => {
    setSelectedEmployee(employee)
    setSelectedSkillIds(employee.skill_cards?.map(s => s.id) || [])
    setSkillModalVisible(true)
  }

  const handleSkillAssign = async () => {
    if (!selectedEmployee) return
    try {
      for (const skillId of selectedSkillIds) {
        await employeeApi.assignSkill(selectedEmployee.id, { skill_card_id: skillId })
      }
      message.success('技能分配成功')
      setSkillModalVisible(false)
      fetchEmployees()
    } catch (err) {
      const error = err as ApiError
      message.error(error.response?.data?.message || '技能分配失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await employeeApi.deleteEmployee(id)
      message.success('删除成功')
      fetchEmployees()
    } catch (_err) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: CreateEmployeeParams | UpdateEmployeeParams) => {
    try {
      if (editingEmployee) {
        await employeeApi.updateEmployee(editingEmployee.id, values as UpdateEmployeeParams)
        message.success('更新成功')
      } else {
        await employeeApi.createEmployee(values as CreateEmployeeParams)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchEmployees()
    } catch (err) {
      const error = err as ApiError
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const columns: TableColumnsType<Employee> = [
    {
      title: '员工',
      key: 'employee',
      render: (_, record: Employee) => (
        <Space>
          <Avatar 
            src={record.avatar_url} 
            icon={<UserOutlined />}
            className="bg-blue-500"
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-gray-500 text-xs">{record.role || '未设置职位'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: '工作统计',
      key: 'stats',
      render: (_, record: Employee) => (
        <Space direction="vertical" size={0}>
          <span>任务: {record.total_tasks || 0}</span>
          <span>成功率: {((record.success_rate || 1) * 100).toFixed(0)}%</span>
        </Space>
      ),
    },
    {
      title: '技能',
      key: 'skills',
      render: (_, record: Employee) => (
        <Space wrap>
          {record.skill_cards?.slice(0, 3).map(skill => (
            <Tooltip key={skill.id} title={skill.name}>
              <Tag color="blue">{skill.name}</Tag>
            </Tooltip>
          ))}
          {(record.skill_cards?.length || 0) > 3 && (
            <Tag>+{(record.skill_cards?.length || 0) - 3}</Tag>
          )}
          {(!record.skill_cards || record.skill_cards.length === 0) && (
            <span className="text-gray-400">无技能</span>
          )}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Employee) => (
        <Space>
          <Tooltip title="查看详情">
            <Button type="link" icon={<SettingOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="分配技能">
            <Button type="link" icon={<ThunderboltOutlined />} onClick={() => handleAssignSkill(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="确定删除此员工？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="删除">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <MainLayout>
      <Content>
        <Card
          title="员工管理"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              招募新员工
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={employees}
            rowKey="id"
            loading={loading}
          />
        </Card>

        {/* 创建/编辑弹窗 */}
        <Modal
          title={editingEmployee ? '编辑员工' : '招募新员工'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="员工名称"
              rules={[{ required: true, message: '请输入员工名称' }]}
            >
              <Input placeholder="例如：小明" />
            </Form.Item>
            <Form.Item name="description" label="职位描述">
              <TextArea rows={3} placeholder="描述员工的职责和能力" />
            </Form.Item>
            <Form.Item name="avatar_url" label="头像URL">
              <Input placeholder="https://example.com/avatar.png" />
            </Form.Item>
          </Form>
        </Modal>

        {/* 技能分配弹窗 */}
        <Modal
          title={`为 ${selectedEmployee?.name} 分配技能`}
          open={skillModalVisible}
          onCancel={() => setSkillModalVisible(false)}
          onOk={handleSkillAssign}
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="选择技能卡"
            value={selectedSkillIds}
            onChange={setSelectedSkillIds}
            options={skillCards.map(s => ({ value: s.id, label: s.name }))}
          />
        </Modal>

        {/* 详情抽屉 */}
        <Drawer
          title="员工详情"
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width={480}
        >
          {selectedEmployee && (
            <>
              <div className="flex items-center mb-6">
                <Avatar 
                  size={64} 
                  src={selectedEmployee.avatar_url}
                  icon={<UserOutlined />}
                  className="bg-blue-500"
                />
                <div className="ml-4">
                  <h2 className="text-xl font-bold">{selectedEmployee.name}</h2>
                  <Tag color={statusMap[selectedEmployee.status]?.color}>
                    {statusMap[selectedEmployee.status]?.text}
                  </Tag>
                </div>
              </div>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="职位">
                  {selectedEmployee.role || '未设置'}
                </Descriptions.Item>
                <Descriptions.Item label="性格特点">
                  {selectedEmployee.personality || '未设置'}
                </Descriptions.Item>
                <Descriptions.Item label="总任务数">
                  {selectedEmployee.total_tasks || 0}
                </Descriptions.Item>
                <Descriptions.Item label="成功率">
                  <Progress 
                    percent={((selectedEmployee.success_rate || 1) * 100)} 
                    size="small"
                    status="active"
                  />
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(selectedEmployee.created_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              <h3 className="mt-6 mb-3 font-bold">已掌握技能</h3>
              {selectedEmployee.skill_cards && selectedEmployee.skill_cards.length > 0 ? (
                <List
                  size="small"
                  dataSource={selectedEmployee.skill_cards}
                  renderItem={skill => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<ThunderboltOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                        title={skill.name}
                        description={skill.category}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-gray-400">暂无技能</div>
              )}
            </>
          )}
        </Drawer>
      </Content>
    </MainLayout>
  )
}
