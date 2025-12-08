package persistence

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"unlimited-corp/internal/domain/company"
	"unlimited-corp/pkg/errors"
)

type CompanyRepository struct {
	db *sqlx.DB
}

func NewCompanyRepository(db *sqlx.DB) *CompanyRepository {
	return &CompanyRepository{db: db}
}

func (r *CompanyRepository) Create(ctx context.Context, c *company.Company) error {
	settings, err := json.Marshal(c.Settings)
	if err != nil {
		return errors.Wrap(err, "failed to marshal settings")
	}

	query := `
		INSERT INTO companies (id, user_id, name, description, logo_url, settings, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err = r.db.ExecContext(ctx, query,
		c.ID, c.UserID, c.Name, c.Description, c.LogoURL, settings, c.CreatedAt, c.UpdatedAt,
	)
	if err != nil {
		return errors.Wrap(err, "failed to create company")
	}
	return nil
}

func (r *CompanyRepository) GetByID(ctx context.Context, id uuid.UUID) (*company.Company, error) {
	query := `
		SELECT id, user_id, name, description, logo_url, settings, created_at, updated_at
		FROM companies WHERE id = $1
	`
	var c company.Company
	var settings []byte
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&c.ID, &c.UserID, &c.Name, &c.Description, &c.LogoURL, &settings, &c.CreatedAt, &c.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(err, "failed to get company")
	}

	if err := json.Unmarshal(settings, &c.Settings); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal settings")
	}
	return &c, nil
}

func (r *CompanyRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*company.Company, error) {
	query := `
		SELECT id, user_id, name, description, logo_url, settings, created_at, updated_at
		FROM companies WHERE user_id = $1
	`
	var c company.Company
	var settings []byte
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&c.ID, &c.UserID, &c.Name, &c.Description, &c.LogoURL, &settings, &c.CreatedAt, &c.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(err, "failed to get company")
	}

	if err := json.Unmarshal(settings, &c.Settings); err != nil {
		return nil, errors.Wrap(err, "failed to unmarshal settings")
	}
	return &c, nil
}

func (r *CompanyRepository) Update(ctx context.Context, c *company.Company) error {
	settings, err := json.Marshal(c.Settings)
	if err != nil {
		return errors.Wrap(err, "failed to marshal settings")
	}

	query := `
		UPDATE companies
		SET name = $1, description = $2, logo_url = $3, settings = $4, updated_at = $5
		WHERE id = $6
	`
	result, err := r.db.ExecContext(ctx, query,
		c.Name, c.Description, c.LogoURL, settings, c.UpdatedAt, c.ID,
	)
	if err != nil {
		return errors.Wrap(err, "failed to update company")
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get rows affected")
	}
	if rows == 0 {
		return errors.ErrNotFound
	}
	return nil
}

func (r *CompanyRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM companies WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return errors.Wrap(err, "failed to delete company")
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return errors.Wrap(err, "failed to get rows affected")
	}
	if rows == 0 {
		return errors.ErrNotFound
	}
	return nil
}
