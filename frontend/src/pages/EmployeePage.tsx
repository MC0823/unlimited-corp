import { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, Input, message, Space, Popconfirm, Layout } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { employeeApi } from '@/api'
import type { Employee } from '@/types'
import MainLayout from '@/components/common/MainLayout'

const { Content } = Layout

export default function EmployeePage() {
  const [form] = Form.useForm()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await employeeApi.listEmployees()
      if (response.code === 0 || response.code === 200) {
        setEmployees(response.data)
      }
    } catch (error: any) {
      message.error('获取员工列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEmployee(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    form.setFieldsValue(employee)
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await employeeApi.deleteEmployee(id)
      message.success('删除成功')
      fetchEmployees()
    } catch (error: any) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (editingEmployee) {
        await employeeApi.updateEmployee(editingEmployee.id, values)
        message.success('更新成功')
      } else {
        await employeeApi.createEmployee(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchEmployees()
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
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
      render: (_: any, record: Employee) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此员工？"
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
          title="员工管理"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建员工
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

        <Modal
          title={editingEmployee ? '编辑员工' : '新建员工'}
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
              <Input />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item name="avatar_url" label="头像URL">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </MainLayout>
  )
}
