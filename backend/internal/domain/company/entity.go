package company

import (
	"time"

	"github.com/google/uuid"
)

type Company struct {
	ID          uuid.UUID              `json:"id"`
	UserID      uuid.UUID              `json:"user_id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	LogoURL     string                 `json:"logo_url"`
	Settings    map[string]interface{} `json:"settings"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

func NewCompany(userID uuid.UUID, name, description string) *Company {
	return &Company{
		ID:          uuid.New(),
		UserID:      userID,
		Name:        name,
		Description: description,
		Settings:    make(map[string]interface{}),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

func (c *Company) GetID() uuid.UUID {
	return c.ID
}
