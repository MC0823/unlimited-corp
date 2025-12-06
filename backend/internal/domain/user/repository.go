package user

import (
	"context"

	"github.com/google/uuid"
)

// Repository 用户仓储接口
type Repository interface {
	// Create 创建用户
	Create(ctx context.Context, user *User) error

	// FindByID 根据ID查找用户
	FindByID(ctx context.Context, id uuid.UUID) (*User, error)

	// FindByEmail 根据邮箱查找用户
	FindByEmail(ctx context.Context, email string) (*User, error)

	// Update 更新用户
	Update(ctx context.Context, user *User) error

	// Delete 删除用户
	Delete(ctx context.Context, id uuid.UUID) error

	// ExistsByEmail 检查邮箱是否存在
	ExistsByEmail(ctx context.Context, email string) (bool, error)
}
