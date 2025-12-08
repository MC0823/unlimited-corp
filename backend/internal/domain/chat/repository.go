package chat

import (
	"context"

	"github.com/google/uuid"
)

type SessionRepository interface {
	CreateSession(ctx context.Context, session *ChatSession) error
	GetSessionByID(ctx context.Context, id uuid.UUID) (*ChatSession, error)
	ListSessionsByCompanyID(ctx context.Context, companyID uuid.UUID, limit, offset int) ([]*ChatSession, error)
	DeleteSession(ctx context.Context, id uuid.UUID) error
}

type MessageRepository interface {
	CreateMessage(ctx context.Context, message *ChatMessage) error
	ListMessagesBySessionID(ctx context.Context, sessionID uuid.UUID, limit, offset int) ([]*ChatMessage, error)
}
