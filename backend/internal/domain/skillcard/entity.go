package skillcard

import (
	"database/sql"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Category represents the skill card category
type Category string

const (
	CategoryResearch      Category = "research"
	CategoryCreation      Category = "creation"
	CategoryAnalysis      Category = "analysis"
	CategoryExecution     Category = "execution"
	CategoryCommunication Category = "communication"
)

// KernelType represents the skill card execution kernel type
type KernelType string

const (
	KernelTypeAIModel   KernelType = "ai_model"
	KernelTypeCodeLogic KernelType = "code_logic"
	KernelTypeHybrid    KernelType = "hybrid"
)

// SkillCard represents a skill card entity
type SkillCard struct {
	ID           uuid.UUID        `json:"id" db:"id"`
	CompanyID    *uuid.UUID       `json:"company_id,omitempty" db:"company_id"`
	Name         string           `json:"name" db:"name"`
	Description  sql.NullString   `json:"description" db:"description"`
	Category     Category         `json:"category" db:"category"`
	Icon         sql.NullString   `json:"icon" db:"icon"`
	KernelType   KernelType       `json:"kernel_type" db:"kernel_type"`
	KernelConfig json.RawMessage  `json:"kernel_config" db:"kernel_config"`
	InputSchema  json.RawMessage  `json:"input_schema" db:"input_schema"`
	OutputSchema json.RawMessage  `json:"output_schema" db:"output_schema"`
	IsSystem     bool             `json:"is_system" db:"is_system"`
	IsPublic     bool             `json:"is_public" db:"is_public"`
	Version      sql.NullString   `json:"version" db:"version"`
	UsageCount   int              `json:"usage_count" db:"usage_count"`
	SuccessRate  float64          `json:"success_rate" db:"success_rate"`
	CreatedAt    time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at" db:"updated_at"`
}

// NewSkillCard creates a new skill card
func NewSkillCard(
	companyID *uuid.UUID,
	name string,
	description string,
	category Category,
	kernelType KernelType,
	kernelConfig json.RawMessage,
) *SkillCard {
	return &SkillCard{
		ID:           uuid.New(),
		CompanyID:    companyID,
		Name:         name,
		Description:  sql.NullString{String: description, Valid: description != ""},
		Category:     category,
		KernelType:   kernelType,
		KernelConfig: kernelConfig,
		InputSchema:  json.RawMessage(`{"type": "object", "properties": {}}`),
		OutputSchema: json.RawMessage(`{"type": "object", "properties": {}}`),
		IsSystem:     false,
		IsPublic:     false,
		Version:      sql.NullString{String: "1.0.0", Valid: true},
		UsageCount:   0,
		SuccessRate:  1.0,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
}

// Update updates the skill card fields
func (s *SkillCard) Update(name, description string, category Category) {
	if name != "" {
		s.Name = name
	}
	if description != "" {
		s.Description = sql.NullString{String: description, Valid: true}
	}
	if category != "" {
		s.Category = category
	}
	s.UpdatedAt = time.Now()
}

// SetSchemas sets the input and output schemas
func (s *SkillCard) SetSchemas(inputSchema, outputSchema json.RawMessage) {
	if inputSchema != nil {
		s.InputSchema = inputSchema
	}
	if outputSchema != nil {
		s.OutputSchema = outputSchema
	}
	s.UpdatedAt = time.Now()
}

// SetKernelConfig updates the kernel configuration
func (s *SkillCard) SetKernelConfig(kernelType KernelType, config json.RawMessage) {
	s.KernelType = kernelType
	s.KernelConfig = config
	s.UpdatedAt = time.Now()
}

// IncrementUsage increments the usage count
func (s *SkillCard) IncrementUsage(success bool) {
	s.UsageCount++
	if !success {
		// Recalculate success rate
		successCount := int(s.SuccessRate * float64(s.UsageCount-1))
		s.SuccessRate = float64(successCount) / float64(s.UsageCount)
	}
	s.UpdatedAt = time.Now()
}

// MakePublic makes the skill card public
func (s *SkillCard) MakePublic() {
	s.IsPublic = true
	s.UpdatedAt = time.Now()
}

// MakePrivate makes the skill card private
func (s *SkillCard) MakePrivate() {
	s.IsPublic = false
	s.UpdatedAt = time.Now()
}

// IsValidCategory checks if the category is valid
func IsValidCategory(category string) bool {
	switch Category(category) {
	case CategoryResearch, CategoryCreation, CategoryAnalysis, CategoryExecution, CategoryCommunication:
		return true
	}
	return false
}

// IsValidKernelType checks if the kernel type is valid
func IsValidKernelType(kernelType string) bool {
	switch KernelType(kernelType) {
	case KernelTypeAIModel, KernelTypeCodeLogic, KernelTypeHybrid:
		return true
	}
	return false
}
