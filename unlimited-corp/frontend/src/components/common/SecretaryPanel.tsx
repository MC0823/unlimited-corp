import { useState, useRef, useEffect } from 'react'
import { Input, Button, Avatar, Spin, Typography } from 'antd'
import { SendOutlined, CloseOutlined, RobotOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import * as chatApi from '@/api/chat'

const { Text } = Typography

// 消息类型
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  actions?: Action[]
}

// 操作类型
interface Action {
  type: 'confirm' | 'cancel' | 'link'
  label: string
  payload?: Record<string, unknown>
}

interface SecretaryPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SecretaryPanel({ isOpen, onClose }: SecretaryPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好，CEO！我是您的私人秘书小智。有什么需要帮忙的吗？',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // 创建或获取会话，然后发送消息
      // 这里简化处理，实际应用中应该维护会话ID
      const response = await chatApi.createMessage({
        session_id: 'default_session',
        content: input,
        role: 'user',
      })

      if (response.code === 0) {
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: response.data.content || '收到您的消息，正在处理中...',
          timestamp: new Date(),
          // actions 字段在当前API中可能不存在，暂时禁用
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // 显示错误消息
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: '抱歉，我遇到了一些问题，请稍后再试。',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      // 模拟回复（当API不可用时）
      const mockResponses = [
        '好的，我正在为您处理这个请求...',
        '收到！让我来帮您看看。',
        '明白了，我会尽快完成这个任务。',
        '您的指令已收到，正在执行中...',
      ]
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  // 处理操作按钮点击
  const handleAction = async (action: Action) => {
    if (action.type === 'confirm') {
      const confirmMessage: Message = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: `确认: ${action.label}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, confirmMessage])

      // 执行确认操作
      setLoading(true)
      setTimeout(() => {
        const resultMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: '好的，正在为您执行操作...',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, resultMessage])
        setLoading(false)
      }, 1000)
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed right-6 bottom-24 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col z-50 border"
        >
          {/* 头部 */}
          <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl">
            <div className="flex items-center gap-3">
              <Avatar 
                size={40} 
                icon={<RobotOutlined />}
                className="bg-white text-blue-500"
              />
              <div>
                <Text strong className="text-white block">小智</Text>
                <Text className="text-blue-100 text-xs">私人秘书 · 在线</Text>
              </div>
            </div>
            <Button 
              type="text" 
              icon={<CloseOutlined />}
              onClick={onClose}
              className="text-white hover:bg-blue-400"
            />
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 shadow-sm border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {/* 操作按钮 */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {msg.actions.map((action, index) => (
                        <Button
                          key={index}
                          size="small"
                          type={action.type === 'confirm' ? 'primary' : 'default'}
                          onClick={() => handleAction(action)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <Text 
                    className={`text-xs mt-1 block ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </div>
              </div>
            ))}
            
            {/* 加载中 */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 shadow-sm border">
                  <Spin size="small" />
                  <Text className="ml-2 text-gray-500">正在思考...</Text>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="p-4 border-t bg-white rounded-b-xl">
            <div className="flex gap-2">
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="有什么需要帮忙的吗？"
                autoSize={{ minRows: 1, maxRows: 3 }}
                className="flex-1"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              />
            </div>
            <Text type="secondary" className="text-xs mt-2 block">
              按 Enter 发送，Shift + Enter 换行
            </Text>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 浮动按钮组件
export function SecretaryFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg flex items-center justify-center z-40 hover:shadow-xl transition-shadow"
    >
      <RobotOutlined className="text-2xl" />
    </motion.button>
  )
}
