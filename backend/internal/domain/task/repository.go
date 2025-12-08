package task

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, task *Task) error
	GetByID(ctx context.Context, id uuid.UUID) (*Task, error)
	ListByCompanyID(ctx context.Context, companyID uuid.UUID, limit, offset int) ([]*Task, error)
	Update(ctx context.Context, task *Task) error
	Delete(ctx context.Context, id uuid.UUID) error
}
