package skillcard

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines the interface for skill card data access
type Repository interface {
	// Create creates a new skill card
	Create(ctx context.Context, skillCard *SkillCard) error

	// GetByID retrieves a skill card by its ID
	GetByID(ctx context.Context, id uuid.UUID) (*SkillCard, error)

	// GetByCompanyID retrieves all skill cards for a company (including system and public cards)
	GetByCompanyID(ctx context.Context, companyID uuid.UUID) ([]*SkillCard, error)

	// GetSystemCards retrieves all system preset skill cards
	GetSystemCards(ctx context.Context) ([]*SkillCard, error)

	// GetPublicCards retrieves all public skill cards
	GetPublicCards(ctx context.Context) ([]*SkillCard, error)

	// Update updates an existing skill card
	Update(ctx context.Context, skillCard *SkillCard) error

	// Delete deletes a skill card by its ID
	Delete(ctx context.Context, id uuid.UUID) error

	// GetByCategory retrieves skill cards by category
	GetByCategory(ctx context.Context, companyID uuid.UUID, category Category) ([]*SkillCard, error)

	// Search searches skill cards by name or description
	Search(ctx context.Context, companyID uuid.UUID, query string) ([]*SkillCard, error)

	// IncrementUsage increments the usage count of a skill card
	IncrementUsage(ctx context.Context, id uuid.UUID, success bool) error
}

// ListFilter represents filter options for listing skill cards
type ListFilter struct {
	CompanyID     *uuid.UUID
	Category      Category
	IsSystem      *bool
	IsPublic      *bool
	SearchQuery   string
	Offset        int
	Limit         int
	OrderBy       string
	OrderDesc     bool
}

// ListResult represents the result of a paginated list query
type ListResult struct {
	SkillCards []*SkillCard
	Total      int64
	Offset     int
	Limit      int
}
