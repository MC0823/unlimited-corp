package chat

import (
	"context"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/chat"
	"unlimited-corp/pkg/errors"
)

type Service struct {
	sessionRepo chat.SessionRepository
	messageRepo chat.MessageRepository
}

func NewService(sessionRepo chat.SessionRepository, messageRepo chat.MessageRepository) *Service {
	return &Service{
		sessionRepo: sessionRepo,
		messageRepo: messageRepo,
	}
}

type CreateSessionInput struct {
	CompanyID uuid.UUID `json:"company_id" binding:"required"`
	Title     string    `json:"title" binding:"required,min=1,max=200"`
}

func (s *Service) CreateSession(ctx context.Context, input *CreateSessionInput) (*chat.ChatSession, error) {
	session := chat.NewChatSession(input.CompanyID, input.Title)
	if err := s.sessionRepo.CreateSession(ctx, session); err != nil {
		return nil, errors.Wrap(err, "failed to create chat session")
	}
	return session, nil
}

func (s *Service) GetSessionByID(ctx context.Context, id uuid.UUID) (*chat.ChatSession, error) {
	return s.sessionRepo.GetSessionByID(ctx, id)
}

func (s *Service) ListSessionsByCompanyID(ctx context.Context, companyID uuid.UUID, limit, offset int) ([]*chat.ChatSession, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.sessionRepo.ListSessionsByCompanyID(ctx, companyID, limit, offset)
}

func (s *Service) DeleteSession(ctx context.Context, id uuid.UUID) error {
	return s.sessionRepo.DeleteSession(ctx, id)
}

type CreateMessageInput struct {
	SessionID uuid.UUID       `json:"session_id" binding:"required"`
	Role      chat.MessageRole `json:"role" binding:"required,oneof=user assistant system"`
	Content   string          `json:"content" binding:"required"`
}

func (s *Service) CreateMessage(ctx context.Context, input *CreateMessageInput) (*chat.ChatMessage, error) {
	message := chat.NewChatMessage(input.SessionID, input.Role, input.Content)
	if err := s.messageRepo.CreateMessage(ctx, message); err != nil {
		return nil, errors.Wrap(err, "failed to create chat message")
	}
	return message, nil
}

func (s *Service) ListMessagesBySessionID(ctx context.Context, sessionID uuid.UUID, limit, offset int) ([]*chat.ChatMessage, error) {
	if limit <= 0 {
		limit = 50
	}
	return s.messageRepo.ListMessagesBySessionID(ctx, sessionID, limit, offset)
}
