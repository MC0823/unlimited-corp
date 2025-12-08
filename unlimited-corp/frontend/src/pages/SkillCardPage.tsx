import { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tabs, Layout, TableColumnsType, Tag, Select, Descriptions, Drawer, Progress, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined, EyeOutlined } from '@ant-design/icons'
import { skillcardApi } from '@/api'
import type { SkillCard, CreateSkillCardParams, UpdateSkillCardParams } from '@/types'
import MainLayout from '@/components/common/MainLayout'

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

// 分类映射
const categoryMap: Record<string, { color: string; text: string }> = {
  research: { color: 'blue', text: '研究' },
  creation: { color: 'green', text: '创作' },
  analysis: { color: 'orange', text: '分析' },
  execution: { color: 'purple', text: '执行' },
  communication: { color: 'cyan', text: '沟通' },
}

// 内核类型映射
const kernelTypeMap: Record<string, string> = {
  ai_model: 'AI模型',
  code_logic: '代码逻辑',
  hybrid: '混合模式',
}

const { Content } = Layout
const { TextArea } = Input
const { Option } = Select

export default function SkillCardPage() {
  const [form] = Form.useForm()
  const [skillCards, setSkillCards] = useState<SkillCard[]>([])
  const [systemCards, setSystemCards] = useState<SkillCard[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingCard, setEditingCard] = useState<SkillCard | null>(null)
  const [selectedCard, setSelectedCard] = useState<SkillCard | null>(null)

  useEffect(() => {
    fetchSkillCards()
    fetchSystemCards()
  }, [])

  const fetchSkillCards = async () => {
    setLoading(true)
    try {
      const response = await skillcardApi.listSkillCards()
      if (response.code === 0 || response.code === 200) {
        setSkillCards(response.data || [])
      }
    } catch (_err) {
      message.error('获取技能卡列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemCards = async () => {
    try {
      const response = await skillcardApi.listSystemSkillCards()
      if (response.code === 0 || response.code === 200) {
        setSystemCards(response.data || [])
      }
    } catch (err) {
      console.error('获取系统技能卡失败', err)
    }
  }

  const handleCreate = () => {
    setEditingCard(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (card: SkillCard) => {
    setEditingCard(card)
    form.setFieldsValue({
      name: card.name,
      description: card.description,
      category: card.category,
      kernel_type: card.kernel_type,
    })
    setModalVisible(true)
  }

  const handleView = (card: SkillCard) => {
    setSelectedCard(card)
    setDrawerVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await skillcardApi.deleteSkillCard(id)
      message.success('删除成功')
      fetchSkillCards()
    } catch (_err) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: CreateSkillCardParams | UpdateSkillCardParams) => {
    try {
      if (editingCard) {
        await skillcardApi.updateSkillCard(editingCard.id, values as UpdateSkillCardParams)
        message.success('更新成功')
      } else {
        await skillcardApi.createSkillCard(values as CreateSkillCardParams)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchSkillCards()
    } catch (err) {
      const error = err as ApiError
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const baseColumns: TableColumnsType<SkillCard> = [
    {
      title: '技能卡',
      key: 'skillcard',
      render: (_, record: SkillCard) => (
        <Space>
          <ThunderboltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-gray-500 text-xs">{record.description?.slice(0, 30) || '无描述'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={categoryMap[category]?.color || 'default'}>
          {categoryMap[category]?.text || category}
        </Tag>
      ),
    },
    {
      title: '内核类型',
      dataIndex: 'kernel_type',
      key: 'kernel_type',
      render: (type: string) => kernelTypeMap[type] || type,
    },
    {
      title: '使用统计',
      key: 'stats',
      render: (_, record: SkillCard) => (
        <Space direction="vertical" size={0}>
          <span>调用: {record.usage_count || 0}次</span>
          <span>成功率: {((record.success_rate || 1) * 100).toFixed(0)}%</span>
        </Space>
      ),
    },
  ]

  const systemColumns: TableColumnsType<SkillCard> = [
    ...baseColumns,
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: SkillCard) => (
        <Tooltip title="查看详情">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)} />
        </Tooltip>
      ),
    },
  ]

  const userColumns: TableColumnsType<SkillCard> = [
    ...baseColumns,
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: SkillCard) => (
        <Space>
          <Tooltip title="查看">
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="确定删除此技能卡？"
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
          title="技能卡管理"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              创建技能卡
            </Button>
          }
        >
          <Tabs
            items={[
              {
                key: 'user',
                label: `我的技能卡 (${skillCards.length})`,
                children: (
                  <Table
                    columns={userColumns}
                    dataSource={skillCards}
                    rowKey="id"
                    loading={loading}
                  />
                ),
              },
              {
                key: 'system',
                label: `系统技能卡 (${systemCards.length})`,
                children: (
                  <Table
                    columns={systemColumns}
                    dataSource={systemCards}
                    rowKey="id"
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* 创建/编辑弹窗 */}
        <Modal
          title={editingCard ? '编辑技能卡' : '创建技能卡'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="技能卡名称"
              rules={[{ required: true, message: '请输入技能卡名称' }]}
            >
              <Input placeholder="例如：内容撰写" />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <TextArea rows={3} placeholder="描述这个技能卡的功能" />
            </Form.Item>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="选择分类">
                <Option value="research">研究</Option>
                <Option value="creation">创作</Option>
                <Option value="analysis">分析</Option>
                <Option value="execution">执行</Option>
                <Option value="communication">沟通</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="kernel_type"
              label="内核类型"
              initialValue="ai_model"
            >
              <Select>
                <Option value="ai_model">AI模型</Option>
                <Option value="code_logic">代码逻辑</Option>
                <Option value="hybrid">混合模式</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* 详情抽屉 */}
        <Drawer
          title="技能卡详情"
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          width={520}
        >
          {selectedCard && (
            <>
              <div className="flex items-center mb-6">
                <ThunderboltOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <div className="ml-4">
                  <h2 className="text-xl font-bold">{selectedCard.name}</h2>
                  <Space>
                    <Tag color={categoryMap[selectedCard.category]?.color}>
                      {categoryMap[selectedCard.category]?.text}
                    </Tag>
                    {selectedCard.is_system && <Tag color="gold">系统</Tag>}
                    {selectedCard.is_public && <Tag color="green">公开</Tag>}
                  </Space>
                </div>
              </div>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="描述">
                  {selectedCard.description || '无'}
                </Descriptions.Item>
                <Descriptions.Item label="内核类型">
                  {kernelTypeMap[selectedCard.kernel_type] || selectedCard.kernel_type}
                </Descriptions.Item>
                <Descriptions.Item label="版本">
                  {selectedCard.version || '1.0.0'}
                </Descriptions.Item>
                <Descriptions.Item label="调用次数">
                  {selectedCard.usage_count || 0}
                </Descriptions.Item>
                <Descriptions.Item label="成功率">
                  <Progress 
                    percent={((selectedCard.success_rate || 1) * 100)} 
                    size="small"
                    status="active"
                  />
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(selectedCard.created_at).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {new Date(selectedCard.updated_at).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              {selectedCard.kernel_config && Object.keys(selectedCard.kernel_config).length > 0 && (
                <>
                  <h3 className="mt-6 mb-3 font-bold">内核配置</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedCard.kernel_config, null, 2)}
                  </pre>
                </>
              )}
            </>
          )}
        </Drawer>
      </Content>
    </MainLayout>
  )
}
