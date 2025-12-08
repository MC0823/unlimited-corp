package company

import (
	"context"
	"time"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/company"
	"unlimited-corp/pkg/errors"
)

type Service struct {
	repo company.Repository
}

func NewService(repo company.Repository) *Service {
	return &Service{repo: repo}
}

type CreateInput struct {
	UserID      uuid.UUID `json:"-"`
	Name        string    `json:"name" binding:"required,min=2,max=200"`
	Description string    `json:"description"`
	LogoURL     string    `json:"logo_url"`
}

func (s *Service) Create(ctx context.Context, input *CreateInput) (*company.Company, error) {
	existing, err := s.repo.GetByUserID(ctx, input.UserID)
	if err != nil && err != errors.ErrNotFound {
		return nil, errors.Wrap(err, "failed to check existing company")
	}
	if existing != nil {
		return nil, errors.ErrConflict
	}

	c := company.NewCompany(input.UserID, input.Name, input.Description)
	c.LogoURL = input.LogoURL

	if err := s.repo.Create(ctx, c); err != nil {
		return nil, errors.Wrap(err, "failed to create company")
	}
	return c, nil
}

func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*company.Company, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) GetByUserID(ctx context.Context, userID uuid.UUID) (*company.Company, error) {
	return s.repo.GetByUserID(ctx, userID)
}

func (s *Service) GetCompanyIDByUserID(ctx context.Context, userID uuid.UUID) (uuid.UUID, error) {
	c, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return uuid.Nil, err
	}
	return c.ID, nil
}

type UpdateInput struct {
	Name        string `json:"name" binding:"required,min=2,max=200"`
	Description string `json:"description"`
	LogoURL     string `json:"logo_url"`
}

func (s *Service) Update(ctx context.Context, id uuid.UUID, input *UpdateInput) (*company.Company, error) {
	c, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	c.Name = input.Name
	c.Description = input.Description
	c.LogoURL = input.LogoURL
	c.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, c); err != nil {
		return nil, errors.Wrap(err, "failed to update company")
	}
	return c, nil
}

func (s *Service) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}
