import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWebSocketStore } from './websocketStore'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  onopen: (() => void) | null = null
  onclose: ((event: { code: number; reason: string }) => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: ((error: Event) => void) | null = null

  constructor(_url: string) {
    // Simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      this.onopen?.()
    }, 10)
  }

  send = vi.fn()
  close = vi.fn((code?: number, _reason?: string) => {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.({ code: code || 1000, reason: 'Normal closure' })
  })
}

// Replace global WebSocket with mock
vi.stubGlobal('WebSocket', MockWebSocket)

describe('websocketStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useWebSocketStore.setState({
      status: 'disconnected',
      reconnectAttempts: 0,
      handlers: new Map(),
    })
    vi.clearAllMocks()
  })

  it('should have initial state', () => {
    const state = useWebSocketStore.getState()

    expect(state.status).toBe('disconnected')
    expect(state.reconnectAttempts).toBe(0)
    expect(state.handlers.size).toBe(0)
  })

  it('should set status to connecting when connect is called', () => {
    useWebSocketStore.getState().connect('test-token')

    expect(useWebSocketStore.getState().status).toBe('connecting')
  })

  it('should subscribe to message type', () => {
    const handler = vi.fn()
    const unsubscribe = useWebSocketStore.getState().subscribe('task.update', handler)

    const state = useWebSocketStore.getState()
    expect(state.handlers.has('task.update')).toBe(true)

    // Unsubscribe
    unsubscribe()
    expect(useWebSocketStore.getState().handlers.get('task.update')?.size || 0).toBe(0)
  })

  it('should support multiple handlers for same message type', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    useWebSocketStore.getState().subscribe('task.update', handler1)
    useWebSocketStore.getState().subscribe('task.update', handler2)

    const handlers = useWebSocketStore.getState().handlers.get('task.update')
    expect(handlers?.size).toBe(2)
  })

  it('should disconnect and reset state', () => {
    // First connect
    useWebSocketStore.getState().connect('test-token')

    // Then disconnect
    useWebSocketStore.getState().disconnect()

    const state = useWebSocketStore.getState()
    expect(state.status).toBe('disconnected')
    expect(state.reconnectAttempts).toBe(0)
  })
})
