import { useEffect } from 'react'
import { message, notification } from 'antd'
import { useAuthStore } from '@/stores/authStore'
import { useWebSocketStore } from '@/stores/websocketStore'
import type { NotificationPayload, TaskUpdatePayload, EmployeeUpdatePayload } from '@/types'

interface WebSocketProviderProps {
  children: React.ReactNode
}

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { isAuthenticated, token } = useAuthStore()
  const { status, connect, disconnect, subscribe } = useWebSocketStore()

  // 连接/断开WebSocket
  useEffect(() => {
    if (isAuthenticated && token?.access_token) {
      connect(token.access_token)
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, token, connect, disconnect])

  // 订阅通知
  useEffect(() => {
    if (status !== 'connected') return

    const unsubNotification = subscribe<NotificationPayload>('notification', (payload) => {
      notification.open({
        message: payload.title,
        description: payload.message,
        type: payload.level,
        placement: 'topRight',
      })
    })

    const unsubTaskUpdate = subscribe<TaskUpdatePayload>('task.update', (payload) => {
      message.info(`任务 "${payload.title}" 状态更新为 ${getTaskStatusText(payload.status)}`)
    })

    const unsubTaskCompleted = subscribe<TaskUpdatePayload>('task.completed', (payload) => {
      notification.success({
        message: '任务完成',
        description: `任务 "${payload.title}" 已成功完成！`,
        placement: 'topRight',
      })
    })

    const unsubEmployeeUpdate = subscribe<EmployeeUpdatePayload>('employee.update', (payload) => {
      console.log('员工状态更新:', payload)
    })

    return () => {
      unsubNotification()
      unsubTaskUpdate()
      unsubTaskCompleted()
      unsubEmployeeUpdate()
    }
  }, [status, subscribe])

  return <>{children}</>
}

// 任务状态文本转换
function getTaskStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    running: '执行中',
    paused: '已暂停',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}
