package persistence

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/user"
	"unlimited-corp/internal/infrastructure/database"
)

// UserRepository 用户仓储实现
type UserRepository struct {
	db *database.DB
}

// NewUserRepository 创建用户仓储
func NewUserRepository(db *database.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create 创建用户
func (r *UserRepository) Create(ctx context.Context, u *user.User) error {
	query := `
		INSERT INTO users (id, email, password_hash, nickname, avatar_url, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.ExecContext(ctx, query,
		u.ID, u.Email, u.PasswordHash, u.Nickname, u.AvatarURL, u.Status, u.CreatedAt, u.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// FindByID 根据ID查找用户
func (r *UserRepository) FindByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	query := `SELECT * FROM users WHERE id = $1`

	var u user.User
	if err := r.db.GetContext(ctx, &u, query, id); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	return &u, nil
}

// FindByEmail 根据邮箱查找用户
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	query := `SELECT * FROM users WHERE email = $1`

	var u user.User
	if err := r.db.GetContext(ctx, &u, query, email); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}

	return &u, nil
}

// Update 更新用户
func (r *UserRepository) Update(ctx context.Context, u *user.User) error {
	query := `
		UPDATE users 
		SET email = $1, password_hash = $2, nickname = $3, avatar_url = $4, status = $5, updated_at = $6
		WHERE id = $7
	`

	result, err := r.db.ExecContext(ctx, query,
		u.Email, u.PasswordHash, u.Nickname, u.AvatarURL, u.Status, u.UpdatedAt, u.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// Delete 删除用户
func (r *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// ExistsByEmail 检查邮箱是否存在
func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`

	var exists bool
	if err := r.db.GetContext(ctx, &exists, query, email); err != nil {
		return false, fmt.Errorf("failed to check email exists: %w", err)
	}

	return exists, nil
}

// 确保实现了接口
var _ user.Repository = (*UserRepository)(nil)
