package chat

import (
	"time"

	"github.com/google/uuid"
)

type MessageRole string

const (
	RoleUser      MessageRole = "user"
	RoleAssistant MessageRole = "assistant"
	RoleSystem    MessageRole = "system"
)

type ChatSession struct {
	ID        uuid.UUID `json:"id"`
	CompanyID uuid.UUID `json:"company_id"`
	Title     string    `json:"title"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ChatMessage struct {
	ID        uuid.UUID              `json:"id"`
	SessionID uuid.UUID              `json:"session_id"`
	Role      MessageRole            `json:"role"`
	Content   string                 `json:"content"`
	Actions   map[string]interface{} `json:"actions"`
	CreatedAt time.Time              `json:"created_at"`
}

func NewChatSession(companyID uuid.UUID, title string) *ChatSession {
	return &ChatSession{
		ID:        uuid.New(),
		CompanyID: companyID,
		Title:     title,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

func NewChatMessage(sessionID uuid.UUID, role MessageRole, content string) *ChatMessage {
	return &ChatMessage{
		ID:        uuid.New(),
		SessionID: sessionID,
		Role:      role,
		Content:   content,
		Actions:   make(map[string]interface{}),
		CreatedAt: time.Now(),
	}
}
