package skillcard

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/skillcard"
	"unlimited-corp/pkg/errors"
)

// Service handles skill card business logic
type Service struct {
	repo skillcard.Repository
}

// NewService creates a new skill card service
func NewService(repo skillcard.Repository) *Service {
	return &Service{repo: repo}
}

// CreateInput represents the input for creating a skill card
type CreateInput struct {
	CompanyID    uuid.UUID       `json:"-"`
	Name         string          `json:"name" binding:"required,min=2,max=200"`
	Description  string          `json:"description"`
	Category     string          `json:"category" binding:"required"`
	Icon         string          `json:"icon"`
	KernelType   string          `json:"kernel_type" binding:"required"`
	KernelConfig json.RawMessage `json:"kernel_config" binding:"required"`
	InputSchema  json.RawMessage `json:"input_schema"`
	OutputSchema json.RawMessage `json:"output_schema"`
}

// Create creates a new skill card
func (s *Service) Create(ctx context.Context, input *CreateInput) (*skillcard.SkillCard, error) {
	// Validate category
	if !skillcard.IsValidCategory(input.Category) {
		return nil, errors.New(400, "invalid category")
	}

	// Validate kernel type
	if !skillcard.IsValidKernelType(input.KernelType) {
		return nil, errors.New(400, "invalid kernel type")
	}

	// Create skill card
	card := skillcard.NewSkillCard(
		&input.CompanyID,
		input.Name,
		input.Description,
		skillcard.Category(input.Category),
		skillcard.KernelType(input.KernelType),
		input.KernelConfig,
	)

	// Set schemas if provided
	if input.InputSchema != nil || input.OutputSchema != nil {
		card.SetSchemas(input.InputSchema, input.OutputSchema)
	}

	if input.Icon != "" {
		card.Icon = sql.NullString{String: input.Icon, Valid: true}
	}

	// Save to database
	if err := s.repo.Create(ctx, card); err != nil {
		return nil, errors.Wrap(err, "failed to create skill card")
	}

	return card, nil
}

// GetByID retrieves a skill card by ID
func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*skillcard.SkillCard, error) {
	card, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get skill card")
	}
	if card == nil {
		return nil, errors.ErrNotFound
	}

	return card, nil
}

// ListInput represents the input for listing skill cards
type ListInput struct {
	CompanyID uuid.UUID
	Category  string
	Query     string
}

// List retrieves skill cards for a company
func (s *Service) List(ctx context.Context, input *ListInput) ([]*skillcard.SkillCard, error) {
	var cards []*skillcard.SkillCard
	var err error

	if input.Query != "" {
		cards, err = s.repo.Search(ctx, input.CompanyID, input.Query)
	} else if input.Category != "" {
		if !skillcard.IsValidCategory(input.Category) {
			return nil, errors.New(400, "invalid category")
		}
		cards, err = s.repo.GetByCategory(ctx, input.CompanyID, skillcard.Category(input.Category))
	} else {
		cards, err = s.repo.GetByCompanyID(ctx, input.CompanyID)
	}

	if err != nil {
		return nil, errors.Wrap(err, "failed to list skill cards")
	}

	return cards, nil
}

// ListSystemCards retrieves all system skill cards
func (s *Service) ListSystemCards(ctx context.Context) ([]*skillcard.SkillCard, error) {
	cards, err := s.repo.GetSystemCards(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list system skill cards: %w", err)
	}

	return cards, nil
}

// UpdateInput represents the input for updating a skill card
type UpdateInput struct {
	ID           uuid.UUID       `json:"-"`
	CompanyID    uuid.UUID       `json:"-"`
	Name         string          `json:"name"`
	Description  string          `json:"description"`
	Category     string          `json:"category"`
	Icon         string          `json:"icon"`
	KernelType   string          `json:"kernel_type"`
	KernelConfig json.RawMessage `json:"kernel_config"`
	InputSchema  json.RawMessage `json:"input_schema"`
	OutputSchema json.RawMessage `json:"output_schema"`
	IsPublic     *bool           `json:"is_public"`
}

// Update updates an existing skill card
func (s *Service) Update(ctx context.Context, input *UpdateInput) (*skillcard.SkillCard, error) {
	// Get existing card
	card, err := s.repo.GetByID(ctx, input.ID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get skill card")
	}
	if card == nil {
		return nil, errors.ErrNotFound
	}

	// Check ownership (system cards cannot be updated)
	if card.IsSystem {
		return nil, errors.New(403, "cannot update system skill card")
	}
	if card.CompanyID != nil && *card.CompanyID != input.CompanyID {
		return nil, errors.New(403, "no permission to update this skill card")
	}

	// Validate category if provided
	if input.Category != "" && !skillcard.IsValidCategory(input.Category) {
		return nil, errors.New(400, "invalid category")
	}

	// Update fields
	card.Update(input.Name, input.Description, skillcard.Category(input.Category))

	if input.Icon != "" {
		card.Icon = sql.NullString{String: input.Icon, Valid: true}
	}

	if input.KernelType != "" && input.KernelConfig != nil {
		if !skillcard.IsValidKernelType(input.KernelType) {
			return nil, errors.New(400, "invalid kernel type")
		}
		card.SetKernelConfig(skillcard.KernelType(input.KernelType), input.KernelConfig)
	}

	if input.InputSchema != nil || input.OutputSchema != nil {
		card.SetSchemas(input.InputSchema, input.OutputSchema)
	}

	if input.IsPublic != nil {
		if *input.IsPublic {
			card.MakePublic()
		} else {
			card.MakePrivate()
		}
	}

	// Save changes
	if err := s.repo.Update(ctx, card); err != nil {
		return nil, errors.Wrap(err, "failed to update skill card")
	}

	return card, nil
}

// Delete deletes a skill card
func (s *Service) Delete(ctx context.Context, id uuid.UUID, companyID uuid.UUID) error {
	// Get existing card
	card, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return errors.Wrap(err, "failed to get skill card")
	}
	if card == nil {
		return errors.ErrNotFound
	}

	// Check ownership
	if card.IsSystem {
		return errors.New(403, "cannot delete system skill card")
	}
	if card.CompanyID != nil && *card.CompanyID != companyID {
		return errors.New(403, "no permission to delete this skill card")
	}

	// Delete
	if err := s.repo.Delete(ctx, id); err != nil {
		return errors.Wrap(err, "failed to delete skill card")
	}

	return nil
}

// IncrementUsage increments the usage count of a skill card
func (s *Service) IncrementUsage(ctx context.Context, id uuid.UUID, success bool) error {
	if err := s.repo.IncrementUsage(ctx, id, success); err != nil {
		return errors.Wrap(err, "failed to increment usage")
	}

	return nil
}
