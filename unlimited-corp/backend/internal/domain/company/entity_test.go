package company

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewCompany(t *testing.T) {
	tests := []struct {
		name        string
		userID      uuid.UUID
		companyName string
		description string
	}{
		{
			name:        "create company with all fields",
			userID:      uuid.New(),
			companyName: "Test Company",
			description: "A test company description",
		},
		{
			name:        "create company with empty description",
			userID:      uuid.New(),
			companyName: "Another Company",
			description: "",
		},
		{
			name:        "create company with unicode name",
			userID:      uuid.New(),
			companyName: "测试公司",
			description: "中文描述",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			company := NewCompany(tt.userID, tt.companyName, tt.description)

			require.NotNil(t, company)
			assert.NotEqual(t, uuid.Nil, company.ID)
			assert.Equal(t, tt.userID, company.UserID)
			assert.Equal(t, tt.companyName, company.Name)
			assert.Equal(t, tt.description, company.Description)
			assert.NotNil(t, company.Settings)
			assert.Empty(t, company.Settings)
			assert.False(t, company.CreatedAt.IsZero())
			assert.False(t, company.UpdatedAt.IsZero())
		})
	}
}

func TestNewCompany_UniqueIDs(t *testing.T) {
	userID := uuid.New()
	company1 := NewCompany(userID, "Company 1", "Description 1")
	company2 := NewCompany(userID, "Company 2", "Description 2")

	assert.NotEqual(t, company1.ID, company2.ID, "Each company should have a unique ID")
}

func TestCompany_GetID(t *testing.T) {
	userID := uuid.New()
	company := NewCompany(userID, "Test", "Desc")

	assert.Equal(t, company.ID, company.GetID())
}

func TestCompany_SettingsInitialized(t *testing.T) {
	company := NewCompany(uuid.New(), "Test", "")

	// Settings should be initialized as empty map
	require.NotNil(t, company.Settings)

	// Should be able to add settings
	company.Settings["theme"] = "dark"
	company.Settings["language"] = "zh-CN"

	assert.Equal(t, "dark", company.Settings["theme"])
	assert.Equal(t, "zh-CN", company.Settings["language"])
}

func TestCompany_TimestampsSet(t *testing.T) {
	company := NewCompany(uuid.New(), "Test", "")

	// CreatedAt and UpdatedAt should be set to current time
	assert.False(t, company.CreatedAt.IsZero())
	assert.False(t, company.UpdatedAt.IsZero())
	// They should be approximately equal (created at same time)
	assert.WithinDuration(t, company.CreatedAt, company.UpdatedAt, 0)
}
