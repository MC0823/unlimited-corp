package websocket

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"unlimited-corp/pkg/logger"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // 开发环境允许所有来源
	},
}

// MessageType 消息类型
type MessageType string

const (
	MessageTypeTaskUpdate     MessageType = "task.update"
	MessageTypeTaskCreated    MessageType = "task.created"
	MessageTypeTaskCompleted  MessageType = "task.completed"
	MessageTypeEmployeeUpdate MessageType = "employee.update"
	MessageTypeEmployeeOnline MessageType = "employee.online"
	MessageTypeEmployeeOffline MessageType = "employee.offline"
	MessageTypeChatMessage    MessageType = "chat.message"
	MessageTypeChatResponse   MessageType = "chat.response"
	MessageTypeNotification   MessageType = "notification"
	MessageTypePing           MessageType = "ping"
	MessageTypePong           MessageType = "pong"
)

// Message WebSocket消息结构
type Message struct {
	ID        string          `json:"id"`
	Type      MessageType     `json:"type"`
	Payload   json.RawMessage `json:"payload"`
	Timestamp time.Time       `json:"timestamp"`
}

// Client WebSocket客户端
type Client struct {
	ID        string
	UserID    string
	CompanyID string
	Conn      *websocket.Conn
	Send      chan *Message
	Hub       *Hub
}

// Hub WebSocket连接管理中心
type Hub struct {
	clients    map[string]*Client          // 所有客户端
	companies  map[string]map[string]*Client // 按公司分组的客户端
	users      map[string]*Client           // 按用户ID索引
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message
	mu         sync.RWMutex
}

// NewHub 创建新的Hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		companies:  make(map[string]map[string]*Client),
		users:      make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *Message),
	}
}

// Run 启动Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.registerClient(client)
		case client := <-h.unregister:
			h.unregisterClient(client)
		case message := <-h.broadcast:
			h.broadcastMessage(message)
		}
	}
}

func (h *Hub) registerClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	h.clients[client.ID] = client
	h.users[client.UserID] = client

	// 按公司分组
	if client.CompanyID != "" {
		if h.companies[client.CompanyID] == nil {
			h.companies[client.CompanyID] = make(map[string]*Client)
		}
		h.companies[client.CompanyID][client.ID] = client
	}

	logger.Info("WebSocket client registered: " + client.ID)
}

func (h *Hub) unregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.clients[client.ID]; ok {
		delete(h.clients, client.ID)
		delete(h.users, client.UserID)
		
		if client.CompanyID != "" && h.companies[client.CompanyID] != nil {
			delete(h.companies[client.CompanyID], client.ID)
		}
		
		close(client.Send)
		logger.Info("WebSocket client unregistered: " + client.ID)
	}
}

func (h *Hub) broadcastMessage(message *Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.clients {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(h.clients, client.ID)
		}
	}
}

// SendToUser 发送消息给特定用户
func (h *Hub) SendToUser(userID string, message *Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if client, ok := h.users[userID]; ok {
		select {
		case client.Send <- message:
		default:
			// 发送失败，客户端可能已断开
		}
	}
}

// SendToCompany 发送消息给公司内所有用户
func (h *Hub) SendToCompany(companyID string, message *Message) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if clients, ok := h.companies[companyID]; ok {
		for _, client := range clients {
			select {
			case client.Send <- message:
			default:
				// 发送失败
			}
		}
	}
}

// Broadcast 广播消息给所有客户端
func (h *Hub) Broadcast(message *Message) {
	h.broadcast <- message
}

// GetOnlineCount 获取在线人数
func (h *Hub) GetOnlineCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// GetCompanyOnlineCount 获取公司在线人数
func (h *Hub) GetCompanyOnlineCount(companyID string) int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if clients, ok := h.companies[companyID]; ok {
		return len(clients)
	}
	return 0
}

// readPump 读取客户端消息
func (c *Client) readPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512 * 1024) // 512KB
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, data, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.Error("WebSocket read error: " + err.Error())
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(data, &msg); err != nil {
			continue
		}

		// 处理ping消息
		if msg.Type == MessageTypePing {
			pong := &Message{
				ID:        uuid.New().String(),
				Type:      MessageTypePong,
				Timestamp: time.Now(),
			}
			c.Send <- pong
		}
	}
}

// writePump 写入消息到客户端
func (c *Client) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			data, err := json.Marshal(message)
			if err != nil {
				continue
			}

			if err := c.Conn.WriteMessage(websocket.TextMessage, data); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Handler WebSocket处理器
type Handler struct {
	hub *Hub
}

// NewHandler 创建WebSocket处理器
func NewHandler(hub *Hub) *Handler {
	return &Handler{hub: hub}
}

// HandleConnection 处理WebSocket连接
func (h *Handler) HandleConnection(c *gin.Context) {
	// 从上下文获取用户信息
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(401, gin.H{"error": "unauthorized"})
		return
	}

	companyID, _ := c.Get("companyID")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logger.Error("WebSocket upgrade failed: " + err.Error())
		return
	}

	client := &Client{
		ID:        uuid.New().String(),
		UserID:    userID.(string),
		CompanyID: companyID.(string),
		Conn:      conn,
		Send:      make(chan *Message, 256),
		Hub:       h.hub,
	}

	h.hub.register <- client

	// 启动读写goroutine
	go client.writePump()
	go client.readPump()
}

// GetHub 获取Hub实例
func (h *Handler) GetHub() *Hub {
	return h.hub
}
