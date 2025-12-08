package notification

import (
	"context"
	"encoding/json"
	"time"

	"unlimited-corp/internal/infrastructure/eventbus"
	"unlimited-corp/internal/interfaces/websocket"
	"unlimited-corp/pkg/logger"

	"github.com/google/uuid"
)

// NotificationService 通知服务
type NotificationService struct {
	hub      *websocket.Hub
	eventBus *eventbus.EventBus
}

// NewNotificationService 创建通知服务
func NewNotificationService(hub *websocket.Hub) *NotificationService {
	return &NotificationService{
		hub:      hub,
		eventBus: eventbus.GetEventBus(),
	}
}

// Start 启动通知服务，订阅事件
func (s *NotificationService) Start() {
	// 订阅任务事件
	s.eventBus.Subscribe(eventbus.EventTaskCreated, s.handleTaskCreated)
	s.eventBus.Subscribe(eventbus.EventTaskAssigned, s.handleTaskAssigned)
	s.eventBus.Subscribe(eventbus.EventTaskStarted, s.handleTaskStarted)
	s.eventBus.Subscribe(eventbus.EventTaskCompleted, s.handleTaskCompleted)
	s.eventBus.Subscribe(eventbus.EventTaskFailed, s.handleTaskFailed)
	s.eventBus.Subscribe(eventbus.EventTaskProgress, s.handleTaskProgress)

	// 订阅员工事件
	s.eventBus.Subscribe(eventbus.EventEmployeeOnline, s.handleEmployeeOnline)
	s.eventBus.Subscribe(eventbus.EventEmployeeOffline, s.handleEmployeeOffline)
	s.eventBus.Subscribe(eventbus.EventEmployeeBusy, s.handleEmployeeBusy)
	s.eventBus.Subscribe(eventbus.EventEmployeeIdle, s.handleEmployeeIdle)

	// 订阅聊天事件
	s.eventBus.Subscribe(eventbus.EventChatMessage, s.handleChatMessage)
	s.eventBus.Subscribe(eventbus.EventChatResponse, s.handleChatResponse)

	logger.Info("Notification service started")
}

// handleTaskCreated 处理任务创建事件
func (s *NotificationService) handleTaskCreated(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeTaskCreated, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleTaskAssigned 处理任务分配事件
func (s *NotificationService) handleTaskAssigned(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeTaskUpdate, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleTaskStarted 处理任务开始事件
func (s *NotificationService) handleTaskStarted(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeTaskUpdate, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleTaskCompleted 处理任务完成事件
func (s *NotificationService) handleTaskCompleted(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeTaskCompleted, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleTaskFailed 处理任务失败事件
func (s *NotificationService) handleTaskFailed(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeTaskUpdate, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleTaskProgress 处理任务进度事件
func (s *NotificationService) handleTaskProgress(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeTaskUpdate, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleEmployeeOnline 处理员工上线事件
func (s *NotificationService) handleEmployeeOnline(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeEmployeeOnline, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleEmployeeOffline 处理员工离线事件
func (s *NotificationService) handleEmployeeOffline(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeEmployeeOffline, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleEmployeeBusy 处理员工忙碌事件
func (s *NotificationService) handleEmployeeBusy(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeEmployeeUpdate, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleEmployeeIdle 处理员工空闲事件
func (s *NotificationService) handleEmployeeIdle(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeEmployeeUpdate, event.Payload)
	s.hub.SendToCompany(event.Metadata.CompanyID, msg)
	return nil
}

// handleChatMessage 处理聊天消息事件
func (s *NotificationService) handleChatMessage(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeChatMessage, event.Payload)
	s.hub.SendToUser(event.Metadata.UserID, msg)
	return nil
}

// handleChatResponse 处理聊天响应事件
func (s *NotificationService) handleChatResponse(ctx context.Context, event *eventbus.Event) error {
	msg := s.createWebSocketMessage(websocket.MessageTypeChatResponse, event.Payload)
	s.hub.SendToUser(event.Metadata.UserID, msg)
	return nil
}

// createWebSocketMessage 创建WebSocket消息
func (s *NotificationService) createWebSocketMessage(msgType websocket.MessageType, payload json.RawMessage) *websocket.Message {
	return &websocket.Message{
		ID:        uuid.New().String(),
		Type:      msgType,
		Payload:   payload,
		Timestamp: time.Now(),
	}
}

// NotifyUser 发送通知给用户
func (s *NotificationService) NotifyUser(userID string, notification interface{}) error {
	payload, err := json.Marshal(notification)
	if err != nil {
		return err
	}

	msg := &websocket.Message{
		ID:        uuid.New().String(),
		Type:      websocket.MessageTypeNotification,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	s.hub.SendToUser(userID, msg)
	return nil
}

// NotifyCompany 发送通知给公司
func (s *NotificationService) NotifyCompany(companyID string, notification interface{}) error {
	payload, err := json.Marshal(notification)
	if err != nil {
		return err
	}

	msg := &websocket.Message{
		ID:        uuid.New().String(),
		Type:      websocket.MessageTypeNotification,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	s.hub.SendToCompany(companyID, msg)
	return nil
}

// BroadcastNotification 广播通知
func (s *NotificationService) BroadcastNotification(notification interface{}) error {
	payload, err := json.Marshal(notification)
	if err != nil {
		return err
	}

	msg := &websocket.Message{
		ID:        uuid.New().String(),
		Type:      websocket.MessageTypeNotification,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	s.hub.Broadcast(msg)
	return nil
}
