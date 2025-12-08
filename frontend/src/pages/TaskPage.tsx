import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Select, Input, message, Progress, Empty } from 'antd'
import { 
  PlusOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  EyeOutlined 
} from '@ant-design/icons'
import MainLayout from '@/components/common/MainLayout'
import * as taskApi from '@/api/task'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

// 任务状态配置
const statusConfig: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '待处理' },
  assigned: { color: 'processing', text: '已分配' },
  running: { color: 'blue', text: '执行中' },
  paused: { color: 'warning', text: '已暂停' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '失败' },
  cancelled: { color: 'default', text: '已取消' },
}

// 优先级配置
const priorityConfig: Record<number, { color: string; text: string }> = {
  1: { color: 'default', text: '低' },
  2: { color: 'blue', text: '中' },
  3: { color: 'orange', text: '高' },
  4: { color: 'red', text: '紧急' },
}

// 扩展Task类型以适应表格展示
interface TableTask {
  id: string
  company_id: string
  name: string
  title: string
  description?: string
  priority: number
  status: string
  progress: number
  output_data?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export default function TaskPage() {
  const [tasks, setTasks] = useState<TableTask[]>([])
  const [loading, setLoading] = useState(false)
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TableTask | null>(null)
  const [form] = Form.useForm()

  // 优先级映射
  const priorityToNumber = (priority: TaskPriority): number => {
    const map: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3, urgent: 4 }
    return map[priority] || 2
  }

  const numberToPriority = (num: number): TaskPriority => {
    const map: Record<number, TaskPriority> = { 1: 'low', 2: 'medium', 3: 'high', 4: 'urgent' }
    return map[num] || 'medium'
  }

  // 获取任务列表 - 暂时使用空字符串获取所有任务
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      // 暂时传递空字符串，后端会返回当前用户的所有任务
      const response = await taskApi.listTasks('')
      if (response.code === 0) {
        const transformedTasks = (response.data || []).map((task: Task) => ({
          ...task,
          name: task.title,
          priority: priorityToNumber(task.priority as TaskPriority),
        }))
        setTasks(transformedTasks)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // 创建任务
  const handleCreateTask = async (values: { name: string; description: string; priority: number }) => {
    try {
      const response = await taskApi.createTask({
        company_id: '', // 后端会根据当前用户获取公司ID
        title: values.name,
        description: values.description,
        priority: numberToPriority(values.priority),
      })
      if (response.code === 0) {
        message.success('任务创建成功')
        setCreateModalVisible(false)
        form.resetFields()
        fetchTasks()
      } else {
        message.error(response.message || '创建失败')
      }
    } catch (error) {
      message.error('创建任务失败')
    }
  }

  // 更新任务状态
  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await taskApi.updateTaskStatus(taskId, { status })
      if (response.code === 0) {
        message.success('状态更新成功')
        fetchTasks()
      } else {
        message.error(response.message || '更新失败')
      }
    } catch (error) {
      message.error('更新状态失败')
    }
  }

  // 查看任务详情
  const handleViewDetail = async (taskId: string) => {
    try {
      const response = await taskApi.getTaskById(taskId)
      if (response.code === 0) {
        const task = response.data
        setSelectedTask({
          ...task,
          name: task.title,
          priority: priorityToNumber(task.priority as TaskPriority),
        })
        setDetailModalVisible(true)
      }
    } catch (error) {
      message.error('获取任务详情失败')
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TableTask) => (
        <a onClick={() => handleViewDetail(record.id)}>{name}</a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => {
        const config = priorityConfig[priority] || { color: 'default', text: '未知' }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number, record: TableTask) => (
        <Progress 
          percent={progress || 0} 
          size="small"
          status={record.status === 'failed' ? 'exception' : undefined}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TableTask) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.id)}
          />
          {record.status === 'pending' && (
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'running')}
            />
          )}
          {record.status === 'running' && (
            <Button 
              type="text" 
              icon={<PauseCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'paused')}
            />
          )}
          {record.status === 'paused' && (
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'running')}
            />
          )}
          {['pending', 'running', 'paused'].includes(record.status) && (
            <Button 
              type="text" 
              danger
              icon={<StopOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'cancelled')}
            />
          )}
          {record.status === 'failed' && (
            <Button 
              type="text" 
              icon={<ReloadOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'pending')}
            />
          )}
        </Space>
      ),
    },
  ]

  return (
    <MainLayout>
      <Card
        title="任务中心"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建任务
          </Button>
        }
      >
        {tasks.length > 0 ? (
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个任务`,
            }}
          />
        ) : (
          <Empty 
            description="暂无任务，点击上方按钮创建第一个任务"
            className="py-12"
          />
        )}
      </Card>

      {/* 创建任务弹窗 */}
      <Modal
        title="创建新任务"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false)
          form.resetFields()
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTask}
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="输入任务名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={3} placeholder="输入任务描述（可选）" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            initialValue={2}
          >
            <Select>
              <Option value={1}>低</Option>
              <Option value={2}>中</Option>
              <Option value={3}>高</Option>
              <Option value={4}>紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setCreateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 任务详情弹窗 */}
      <Modal
        title="任务详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedTask(null)
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <label className="text-gray-500">任务名称</label>
              <p className="text-lg font-medium">{selectedTask.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">状态</label>
                <p>
                  <Tag color={statusConfig[selectedTask.status]?.color}>
                    {statusConfig[selectedTask.status]?.text}
                  </Tag>
                </p>
              </div>
              <div>
                <label className="text-gray-500">优先级</label>
                <p>
                  <Tag color={priorityConfig[selectedTask.priority]?.color}>
                    {priorityConfig[selectedTask.priority]?.text}
                  </Tag>
                </p>
              </div>
            </div>

            <div>
              <label className="text-gray-500">进度</label>
              <Progress 
                percent={selectedTask.progress || 0} 
                status={selectedTask.status === 'failed' ? 'exception' : undefined}
              />
            </div>

            {selectedTask.description && (
              <div>
                <label className="text-gray-500">描述</label>
                <p>{selectedTask.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-500">创建时间</label>
                <p>{dayjs(selectedTask.created_at).format('YYYY-MM-DD HH:mm:ss')}</p>
              </div>
              <div>
                <label className="text-gray-500">更新时间</label>
                <p>{dayjs(selectedTask.updated_at).format('YYYY-MM-DD HH:mm:ss')}</p>
              </div>
            </div>

            {selectedTask.output_data && (
              <div>
                <label className="text-gray-500">输出结果</label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(selectedTask.output_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </MainLayout>
  )
}
