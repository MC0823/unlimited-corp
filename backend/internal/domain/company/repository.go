package company

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, company *Company) error
	GetByID(ctx context.Context, id uuid.UUID) (*Company, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) (*Company, error)
	Update(ctx context.Context, company *Company) error
	Delete(ctx context.Context, id uuid.UUID) error
}
