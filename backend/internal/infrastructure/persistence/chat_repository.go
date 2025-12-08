package persistence

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"unlimited-corp/internal/domain/chat"
	"unlimited-corp/pkg/errors"
)

type ChatRepository struct {
	db *sqlx.DB
}

func NewChatRepository(db *sqlx.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) CreateSession(ctx context.Context, session *chat.ChatSession) error {
	query := `
		INSERT INTO chat_sessions (id, company_id, title, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.ExecContext(ctx, query,
		session.ID, session.CompanyID, session.Title, session.CreatedAt, session.UpdatedAt,
	)
	if err != nil {
		return errors.Wrap(err, "failed to create chat session")
	}
	return nil
}

func (r *ChatRepository) GetSessionByID(ctx context.Context, id uuid.UUID) (*chat.ChatSession, error) {
	query := `
		SELECT id, company_id, title, created_at, updated_at
		FROM chat_sessions WHERE id = $1
	`
	var session chat.ChatSession
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&session.ID, &session.CompanyID, &session.Title, &session.CreatedAt, &session.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(err, "failed to get chat session")
	}
	return &session, nil
}

func (r *ChatRepository) ListSessionsByCompanyID(ctx context.Context, companyID uuid.UUID, limit, offset int) ([]*chat.ChatSession, error) {
	query := `
		SELECT id, company_id, title, created_at, updated_at
		FROM chat_sessions WHERE company_id = $1
		ORDER BY updated_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, companyID, limit, offset)
	if err != nil {
		return nil, errors.Wrap(err, "failed to list chat sessions")
	}
	defer rows.Close()

	var sessions []*chat.ChatSession
	for rows.Next() {
		var session chat.ChatSession
		err := rows.Scan(&session.ID, &session.CompanyID, &session.Title, &session.CreatedAt, &session.UpdatedAt)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan chat session")
		}
		sessions = append(sessions, &session)
	}
	return sessions, nil
}

func (r *ChatRepository) DeleteSession(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM chat_sessions WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return errors.Wrap(err, "failed to delete chat session")
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.ErrNotFound
	}
	return nil
}

func (r *ChatRepository) CreateMessage(ctx context.Context, message *chat.ChatMessage) error {
	actions, _ := json.Marshal(message.Actions)

	query := `
		INSERT INTO chat_messages (id, session_id, role, content, actions, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query,
		message.ID, message.SessionID, message.Role, message.Content, actions, message.CreatedAt,
	)
	if err != nil {
		return errors.Wrap(err, "failed to create chat message")
	}
	return nil
}

func (r *ChatRepository) ListMessagesBySessionID(ctx context.Context, sessionID uuid.UUID, limit, offset int) ([]*chat.ChatMessage, error) {
	query := `
		SELECT id, session_id, role, content, actions, created_at
		FROM chat_messages WHERE session_id = $1
		ORDER BY created_at ASC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, sessionID, limit, offset)
	if err != nil {
		return nil, errors.Wrap(err, "failed to list chat messages")
	}
	defer rows.Close()

	var messages []*chat.ChatMessage
	for rows.Next() {
		var message chat.ChatMessage
		var actions []byte
		err := rows.Scan(&message.ID, &message.SessionID, &message.Role, &message.Content, &actions, &message.CreatedAt)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan chat message")
		}
		json.Unmarshal(actions, &message.Actions)
		messages = append(messages, &message)
	}
	return messages, nil
}
