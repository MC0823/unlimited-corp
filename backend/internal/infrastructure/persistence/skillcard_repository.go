package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/skillcard"
	"unlimited-corp/internal/infrastructure/database"
)

// SkillCardRepository implements the skillcard.Repository interface
type SkillCardRepository struct {
	db *database.DB
}

// NewSkillCardRepository creates a new skill card repository
func NewSkillCardRepository(db *database.DB) *SkillCardRepository {
	return &SkillCardRepository{db: db}
}

// Create creates a new skill card
func (r *SkillCardRepository) Create(ctx context.Context, s *skillcard.SkillCard) error {
	query := `
		INSERT INTO skill_cards (
			id, company_id, name, description, category, icon,
			kernel_type, kernel_config, input_schema, output_schema,
			is_system, is_public, version, usage_count, success_rate,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`

	_, err := r.db.ExecContext(ctx, query,
		s.ID, s.CompanyID, s.Name, s.Description, s.Category, s.Icon,
		s.KernelType, s.KernelConfig, s.InputSchema, s.OutputSchema,
		s.IsSystem, s.IsPublic, s.Version, s.UsageCount, s.SuccessRate,
		s.CreatedAt, s.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create skill card: %w", err)
	}

	return nil
}

// GetByID retrieves a skill card by ID
func (r *SkillCardRepository) GetByID(ctx context.Context, id uuid.UUID) (*skillcard.SkillCard, error) {
	query := `SELECT * FROM skill_cards WHERE id = $1`

	var s skillcard.SkillCard
	if err := r.db.GetContext(ctx, &s, query, id); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get skill card: %w", err)
	}

	return &s, nil
}

// GetByCompanyID retrieves all skill cards for a company (including system and public cards)
func (r *SkillCardRepository) GetByCompanyID(ctx context.Context, companyID uuid.UUID) ([]*skillcard.SkillCard, error) {
	query := `
		SELECT * FROM skill_cards 
		WHERE company_id = $1 
		   OR is_system = true 
		   OR is_public = true
		ORDER BY is_system DESC, name ASC
	`

	var cards []*skillcard.SkillCard
	if err := r.db.SelectContext(ctx, &cards, query, companyID); err != nil {
		return nil, fmt.Errorf("failed to get skill cards by company: %w", err)
	}

	return cards, nil
}

// GetSystemCards retrieves all system preset skill cards
func (r *SkillCardRepository) GetSystemCards(ctx context.Context) ([]*skillcard.SkillCard, error) {
	query := `SELECT * FROM skill_cards WHERE is_system = true ORDER BY name ASC`

	var cards []*skillcard.SkillCard
	if err := r.db.SelectContext(ctx, &cards, query); err != nil {
		return nil, fmt.Errorf("failed to get system skill cards: %w", err)
	}

	return cards, nil
}

// GetPublicCards retrieves all public skill cards
func (r *SkillCardRepository) GetPublicCards(ctx context.Context) ([]*skillcard.SkillCard, error) {
	query := `SELECT * FROM skill_cards WHERE is_public = true ORDER BY usage_count DESC, name ASC`

	var cards []*skillcard.SkillCard
	if err := r.db.SelectContext(ctx, &cards, query); err != nil {
		return nil, fmt.Errorf("failed to get public skill cards: %w", err)
	}

	return cards, nil
}

// Update updates an existing skill card
func (r *SkillCardRepository) Update(ctx context.Context, s *skillcard.SkillCard) error {
	query := `
		UPDATE skill_cards SET
			name = $1, description = $2, category = $3, icon = $4,
			kernel_type = $5, kernel_config = $6, input_schema = $7, output_schema = $8,
			is_public = $9, version = $10, updated_at = $11
		WHERE id = $12 AND is_system = false
	`

	result, err := r.db.ExecContext(ctx, query,
		s.Name, s.Description, s.Category, s.Icon,
		s.KernelType, s.KernelConfig, s.InputSchema, s.OutputSchema,
		s.IsPublic, s.Version, time.Now(), s.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update skill card: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("skill card not found or is system card")
	}

	return nil
}

// Delete deletes a skill card by ID
func (r *SkillCardRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM skill_cards WHERE id = $1 AND is_system = false`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete skill card: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("skill card not found or is system card")
	}

	return nil
}

// GetByCategory retrieves skill cards by category
func (r *SkillCardRepository) GetByCategory(ctx context.Context, companyID uuid.UUID, category skillcard.Category) ([]*skillcard.SkillCard, error) {
	query := `
		SELECT * FROM skill_cards 
		WHERE category = $1 
		  AND (company_id = $2 OR is_system = true OR is_public = true)
		ORDER BY is_system DESC, name ASC
	`

	var cards []*skillcard.SkillCard
	if err := r.db.SelectContext(ctx, &cards, query, category, companyID); err != nil {
		return nil, fmt.Errorf("failed to get skill cards by category: %w", err)
	}

	return cards, nil
}

// Search searches skill cards by name or description
func (r *SkillCardRepository) Search(ctx context.Context, companyID uuid.UUID, searchQuery string) ([]*skillcard.SkillCard, error) {
	query := `
		SELECT * FROM skill_cards 
		WHERE (company_id = $1 OR is_system = true OR is_public = true)
		  AND (name ILIKE $2 OR description ILIKE $2)
		ORDER BY usage_count DESC, name ASC
	`

	pattern := "%" + searchQuery + "%"
	var cards []*skillcard.SkillCard
	if err := r.db.SelectContext(ctx, &cards, query, companyID, pattern); err != nil {
		return nil, fmt.Errorf("failed to search skill cards: %w", err)
	}

	return cards, nil
}

// IncrementUsage increments the usage count of a skill card
func (r *SkillCardRepository) IncrementUsage(ctx context.Context, id uuid.UUID, success bool) error {
	var query string
	if success {
		query = `
			UPDATE skill_cards SET
				usage_count = usage_count + 1,
				updated_at = $2
			WHERE id = $1
		`
	} else {
		query = `
			UPDATE skill_cards SET
				usage_count = usage_count + 1,
				success_rate = (success_rate * (usage_count - 1)) / usage_count,
				updated_at = $2
			WHERE id = $1
		`
	}

	_, err := r.db.ExecContext(ctx, query, id, time.Now())
	if err != nil {
		return fmt.Errorf("failed to increment usage: %w", err)
	}

	return nil
}

// Ensure implementation matches interface
var _ skillcard.Repository = (*SkillCardRepository)(nil)
