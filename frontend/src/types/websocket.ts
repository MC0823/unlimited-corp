export type WsConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'

export interface WsEvent {
  event: string
  data: any
}
