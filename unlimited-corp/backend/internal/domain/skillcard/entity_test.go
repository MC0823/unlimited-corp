package skillcard

import (
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewSkillCard(t *testing.T) {
	companyID := uuid.New()
	name := "Research Skill"
	description := "A skill for research"
	category := CategoryResearch
	kernelType := KernelTypeAIModel
	kernelConfig := json.RawMessage(`{"model": "gpt-4"}`)

	card := NewSkillCard(&companyID, name, description, category, kernelType, kernelConfig)

	require.NotNil(t, card)
	assert.NotEqual(t, uuid.Nil, card.ID)
	assert.Equal(t, &companyID, card.CompanyID)
	assert.Equal(t, name, card.Name)
	assert.True(t, card.Description.Valid)
	assert.Equal(t, description, card.Description.String)
	assert.Equal(t, category, card.Category)
	assert.Equal(t, kernelType, card.KernelType)
	assert.Equal(t, kernelConfig, card.KernelConfig)
	assert.False(t, card.IsSystem)
	assert.False(t, card.IsPublic)
	assert.Equal(t, "1.0.0", card.Version.String)
	assert.Equal(t, 0, card.UsageCount)
	assert.Equal(t, 1.0, card.SuccessRate)
	assert.False(t, card.CreatedAt.IsZero())
}

func TestNewSkillCard_EmptyDescription(t *testing.T) {
	card := NewSkillCard(nil, "Test", "", CategoryAnalysis, KernelTypeCodeLogic, nil)

	assert.False(t, card.Description.Valid)
	assert.Nil(t, card.CompanyID) // System skill
}

func TestSkillCard_Update(t *testing.T) {
	card := NewSkillCard(nil, "Original", "Original Desc", CategoryResearch, KernelTypeAIModel, nil)

	card.Update("New Name", "New Description", CategoryCreation)

	assert.Equal(t, "New Name", card.Name)
	assert.Equal(t, "New Description", card.Description.String)
	assert.Equal(t, CategoryCreation, card.Category)
}

func TestSkillCard_Update_PartialFields(t *testing.T) {
	card := NewSkillCard(nil, "Original", "Original Desc", CategoryResearch, KernelTypeAIModel, nil)
	originalCategory := card.Category

	// Only update name
	card.Update("New Name", "", "")

	assert.Equal(t, "New Name", card.Name)
	assert.Equal(t, "Original Desc", card.Description.String)
	assert.Equal(t, originalCategory, card.Category)
}

func TestSkillCard_SetSchemas(t *testing.T) {
	card := NewSkillCard(nil, "Test", "Desc", CategoryAnalysis, KernelTypeCodeLogic, nil)

	inputSchema := json.RawMessage(`{"type": "object", "properties": {"query": {"type": "string"}}}`)
	outputSchema := json.RawMessage(`{"type": "object", "properties": {"result": {"type": "string"}}}`)

	card.SetSchemas(inputSchema, outputSchema)

	assert.Equal(t, inputSchema, card.InputSchema)
	assert.Equal(t, outputSchema, card.OutputSchema)
}

func TestSkillCard_SetSchemas_NilValues(t *testing.T) {
	card := NewSkillCard(nil, "Test", "Desc", CategoryAnalysis, KernelTypeCodeLogic, nil)
	originalInput := card.InputSchema
	originalOutput := card.OutputSchema

	card.SetSchemas(nil, nil)

	assert.Equal(t, originalInput, card.InputSchema)
	assert.Equal(t, originalOutput, card.OutputSchema)
}

func TestSkillCard_SetKernelConfig(t *testing.T) {
	card := NewSkillCard(nil, "Test", "Desc", CategoryAnalysis, KernelTypeCodeLogic, nil)

	newConfig := json.RawMessage(`{"model": "gpt-4-turbo", "temperature": 0.7}`)
	card.SetKernelConfig(KernelTypeHybrid, newConfig)

	assert.Equal(t, KernelTypeHybrid, card.KernelType)
	assert.Equal(t, newConfig, card.KernelConfig)
}

func TestSkillCard_IncrementUsage_Success(t *testing.T) {
	card := NewSkillCard(nil, "Test", "Desc", CategoryAnalysis, KernelTypeCodeLogic, nil)

	card.IncrementUsage(true)

	assert.Equal(t, 1, card.UsageCount)
	assert.Equal(t, 1.0, card.SuccessRate) // Still 100%
}

func TestSkillCard_IncrementUsage_Failure(t *testing.T) {
	card := NewSkillCard(nil, "Test", "Desc", CategoryAnalysis, KernelTypeCodeLogic, nil)

	// First 4 successes
	for i := 0; i < 4; i++ {
		card.IncrementUsage(true)
	}

	// Then 1 failure
	card.IncrementUsage(false)

	assert.Equal(t, 5, card.UsageCount)
	assert.Equal(t, 0.8, card.SuccessRate) // 4/5 = 0.8
}

func TestSkillCard_MakePublic(t *testing.T) {
	card := NewSkillCard(nil, "Test", "Desc", CategoryAnalysis, KernelTypeCodeLogic, nil)
	assert.False(t, card.IsPublic)

	card.MakePublic()

	assert.True(t, card.IsPublic)
}

func TestSkillCard_MakePrivate(t *testing.T) {
	card := NewSkillCard(nil, "Test", "Desc", CategoryAnalysis, KernelTypeCodeLogic, nil)
	card.MakePublic()

	card.MakePrivate()

	assert.False(t, card.IsPublic)
}

func TestIsValidCategory(t *testing.T) {
	tests := []struct {
		category string
		expected bool
	}{
		{"research", true},
		{"creation", true},
		{"analysis", true},
		{"execution", true},
		{"communication", true},
		{"invalid", false},
		{"", false},
		{"RESEARCH", false}, // Case sensitive
	}

	for _, tt := range tests {
		t.Run(tt.category, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsValidCategory(tt.category))
		})
	}
}

func TestIsValidKernelType(t *testing.T) {
	tests := []struct {
		kernelType string
		expected   bool
	}{
		{"ai_model", true},
		{"code_logic", true},
		{"hybrid", true},
		{"invalid", false},
		{"", false},
		{"AI_MODEL", false}, // Case sensitive
	}

	for _, tt := range tests {
		t.Run(tt.kernelType, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsValidKernelType(tt.kernelType))
		})
	}
}

func TestCategory_Constants(t *testing.T) {
	assert.Equal(t, Category("research"), CategoryResearch)
	assert.Equal(t, Category("creation"), CategoryCreation)
	assert.Equal(t, Category("analysis"), CategoryAnalysis)
	assert.Equal(t, Category("execution"), CategoryExecution)
	assert.Equal(t, Category("communication"), CategoryCommunication)
}

func TestKernelType_Constants(t *testing.T) {
	assert.Equal(t, KernelType("ai_model"), KernelTypeAIModel)
	assert.Equal(t, KernelType("code_logic"), KernelTypeCodeLogic)
	assert.Equal(t, KernelType("hybrid"), KernelTypeHybrid)
}
