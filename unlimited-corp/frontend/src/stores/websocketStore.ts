import { create } from 'zustand'
import type { WsConnectionStatus, WsMessage, WsMessageType } from '@/types'

// WebSocket配置
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/api/v1/ws'
const RECONNECT_INTERVAL = 3000
const MAX_RECONNECT_ATTEMPTS = 10
const PING_INTERVAL = 30000

// 消息处理器类型
type MessageHandler<T = unknown> = (payload: T) => void

interface WebSocketState {
  status: WsConnectionStatus
  reconnectAttempts: number
  handlers: Map<WsMessageType, Set<MessageHandler>>
}

interface WebSocketStore extends WebSocketState {
  connect: (token: string) => void
  disconnect: () => void
  subscribe: <T>(type: WsMessageType, handler: MessageHandler<T>) => () => void
  send: (message: WsMessage) => void
}

// 单例WebSocket实例
let ws: WebSocket | null = null
let pingInterval: ReturnType<typeof setInterval> | null = null
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  status: 'disconnected',
  reconnectAttempts: 0,
  handlers: new Map(),

  connect: (token: string) => {
    // 防止重复连接
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
      return
    }

    set({ status: 'connecting' })

    const url = `${WS_URL}?token=${encodeURIComponent(token)}`
    ws = new WebSocket(url)

    ws.onopen = () => {
      console.log('[WebSocket] Connected')
      set({ status: 'connected', reconnectAttempts: 0 })

      // 启动心跳
      pingInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          const pingMessage: WsMessage = {
            id: crypto.randomUUID(),
            type: 'ping',
            payload: {},
            timestamp: new Date().toISOString(),
          }
          ws.send(JSON.stringify(pingMessage))
        }
      }, PING_INTERVAL)
    }

    ws.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data)
        console.log('[WebSocket] Message received:', message.type)

        // 调用对应类型的处理器
        const { handlers } = get()
        const typeHandlers = handlers.get(message.type)
        if (typeHandlers) {
          typeHandlers.forEach(handler => {
            try {
              handler(message.payload)
            } catch (err) {
              console.error('[WebSocket] Handler error:', err)
            }
          })
        }
      } catch (err) {
        console.error('[WebSocket] Parse error:', err)
      }
    }

    ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected:', event.code, event.reason)
      cleanup()

      const { reconnectAttempts } = get()
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && event.code !== 1000) {
        set({ status: 'reconnecting', reconnectAttempts: reconnectAttempts + 1 })
        reconnectTimeout = setTimeout(() => {
          get().connect(token)
        }, RECONNECT_INTERVAL)
      } else {
        set({ status: 'disconnected' })
      }
    }

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
      set({ status: 'error' })
    }
  },

  disconnect: () => {
    if (ws) {
      ws.close(1000, 'User disconnect')
    }
    cleanup()
    set({ status: 'disconnected', reconnectAttempts: 0 })
  },

  subscribe: <T>(type: WsMessageType, handler: MessageHandler<T>) => {
    set((state) => {
      const handlers = new Map(state.handlers)
      const typeHandlers = handlers.get(type) || new Set()
      typeHandlers.add(handler as MessageHandler)
      handlers.set(type, typeHandlers)
      return { handlers }
    })

    // 返回取消订阅函数
    return () => {
      set((state) => {
        const handlers = new Map(state.handlers)
        const typeHandlers = handlers.get(type)
        if (typeHandlers) {
          typeHandlers.delete(handler as MessageHandler)
          if (typeHandlers.size === 0) {
            handlers.delete(type)
          }
        }
        return { handlers }
      })
    }
  },

  send: (message: WsMessage) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] Cannot send, not connected')
    }
  },
}))

// 清理资源
function cleanup() {
  if (pingInterval) {
    clearInterval(pingInterval)
    pingInterval = null
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  ws = null
}

// 便捷Hook
export function useWebSocket() {
  const { status, connect, disconnect, subscribe, send } = useWebSocketStore()
  return { status, connect, disconnect, subscribe, send }
}
