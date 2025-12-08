export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'

// 消息类型
export type WsMessageType =
  | 'task.update'
  | 'task.created'
  | 'task.completed'
  | 'employee.update'
  | 'employee.online'
  | 'employee.offline'
  | 'chat.message'
  | 'chat.response'
  | 'notification'
  | 'ping'
  | 'pong'

// WebSocket消息结构
export interface WsMessage<T = unknown> {
  id: string
  type: WsMessageType
  payload: T
  timestamp: string
}

// 任务更新负载
export interface TaskUpdatePayload {
  id: string
  title: string
  status: string
  progress: number
  assigned_to?: string
}

// 员工更新负载
export interface EmployeeUpdatePayload {
  id: string
  name: string
  status: string
  current_task_id?: string
}

// 聊天消息负载
export interface ChatMessagePayload {
  session_id: string
  content: string
  role: 'user' | 'assistant'
}

// 通知负载
export interface NotificationPayload {
  title: string
  message: string
  level: 'info' | 'success' | 'warning' | 'error'
}

export interface WsEvent {
  event: string
  data: unknown
}
