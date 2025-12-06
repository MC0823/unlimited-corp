import { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tabs, Layout } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { skillcardApi } from '@/api'
import type { SkillCard } from '@/types'
import MainLayout from '@/components/common/MainLayout'

const { Content } = Layout

export default function SkillCardPage() {
  const [form] = Form.useForm()
  const [skillCards, setSkillCards] = useState<SkillCard[]>([])
  const [systemCards, setSystemCards] = useState<SkillCard[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCard, setEditingCard] = useState<SkillCard | null>(null)

  useEffect(() => {
    fetchSkillCards()
    fetchSystemCards()
  }, [])

  const fetchSkillCards = async () => {
    setLoading(true)
    try {
      const response = await skillcardApi.listSkillCards()
      if (response.code === 0 || response.code === 200) {
        setSkillCards(response.data)
      }
    } catch (error: any) {
      message.error('获取技能卡列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemCards = async () => {
    try {
      const response = await skillcardApi.listSystemSkillCards()
      if (response.code === 0 || response.code === 200) {
        setSystemCards(response.data)
      }
    } catch (error: any) {
      console.error('获取系统技能卡失败', error)
    }
  }

  const handleCreate = () => {
    setEditingCard(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (card: SkillCard) => {
    setEditingCard(card)
    form.setFieldsValue(card)
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await skillcardApi.deleteSkillCard(id)
      message.success('删除成功')
      fetchSkillCards()
    } catch (error: any) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingCard) {
        await skillcardApi.updateSkillCard(editingCard.id, values)
        message.success('更新成功')
      } else {
        await skillcardApi.createSkillCard(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchSkillCards()
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败')
    }
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ]

  const userColumns = [
    ...columns,
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: SkillCard) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此技能卡？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
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
              新建技能卡
            </Button>
          }
        >
          <Tabs
            items={[
              {
                key: 'user',
                label: '我的技能卡',
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
                label: '系统技能卡',
                children: (
                  <Table
                    columns={columns}
                    dataSource={systemCards}
                    rowKey="id"
                  />
                ),
              },
            ]}
          />
        </Card>

        <Modal
          title={editingCard ? '编辑技能卡' : '新建技能卡'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="技能卡名称"
              rules={[{ required: true, message: '请输入技能卡名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入描述' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请输入分类' }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </MainLayout>
  )
}
