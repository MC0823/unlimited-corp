package task

import (
	"context"
	"time"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/task"
	"unlimited-corp/pkg/errors"
)

type Service struct {
	repo task.Repository
}

func NewService(repo task.Repository) *Service {
	return &Service{repo: repo}
}

type CreateInput struct {
	CompanyID   uuid.UUID        `json:"company_id" binding:"required"`
	Title       string           `json:"title" binding:"required,min=2,max=500"`
	Description string           `json:"description"`
	Priority    task.TaskPriority `json:"priority" binding:"required,oneof=low medium high urgent"`
}

func (s *Service) Create(ctx context.Context, input *CreateInput) (*task.Task, error) {
	t := task.NewTask(input.CompanyID, input.Title, input.Description, input.Priority)
	if err := s.repo.Create(ctx, t); err != nil {
		return nil, errors.Wrap(err, "failed to create task")
	}
	return t, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*task.Task, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) ListByCompanyID(ctx context.Context, companyID uuid.UUID, limit, offset int) ([]*task.Task, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.repo.ListByCompanyID(ctx, companyID, limit, offset)
}

type UpdateInput struct {
	Title       string           `json:"title" binding:"required,min=2,max=500"`
	Description string           `json:"description"`
	Priority    task.TaskPriority `json:"priority" binding:"required,oneof=low medium high urgent"`
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, input *UpdateInput) (*task.Task, error) {
	t, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	t.Title = input.Title
	t.Description = input.Description
	t.Priority = input.Priority
	t.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, t); err != nil {
		return nil, errors.Wrap(err, "failed to update task")
	}
	return t, nil
}

func (s *Service) UpdateStatus(ctx context.Context, id uuid.UUID, status task.TaskStatus) (*task.Task, error) {
	t, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	t.Status = status
	t.UpdatedAt = time.Now()

	if status == task.StatusRunning && t.StartedAt == nil {
		now := time.Now()
		t.StartedAt = &now
	}
	if (status == task.StatusCompleted || status == task.StatusFailed) && t.CompletedAt == nil {
		now := time.Now()
		t.CompletedAt = &now
		t.Progress = 100
	}

	if err := s.repo.Update(ctx, t); err != nil {
		return nil, errors.Wrap(err, "failed to update task status")
	}
	return t, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
