package employee

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewEmployee(t *testing.T) {
	companyID := uuid.New()
	name := "John Doe"
	role := "Developer"

	employee := NewEmployee(companyID, name, role)

	require.NotNil(t, employee)
	assert.NotEqual(t, uuid.Nil, employee.ID)
	assert.Equal(t, companyID, employee.CompanyID)
	assert.Equal(t, name, employee.Name)
	assert.Equal(t, role, employee.Role)
	assert.Equal(t, StatusIdle, employee.Status)
	assert.Equal(t, 0, employee.TotalTasks)
	assert.Equal(t, 1.0, employee.SuccessRate)
	assert.Nil(t, employee.CurrentTaskID)
	assert.False(t, employee.CreatedAt.IsZero())
	assert.False(t, employee.UpdatedAt.IsZero())
}

func TestEmployee_Update(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Original", "Original Role")
	originalUpdatedAt := employee.UpdatedAt

	employee.Update("New Name", "New Role", "Friendly", "https://avatar.url")

	assert.Equal(t, "New Name", employee.Name)
	assert.Equal(t, "New Role", employee.Role)
	assert.Equal(t, "Friendly", employee.Personality)
	assert.Equal(t, "https://avatar.url", employee.AvatarURL)
	assert.True(t, employee.UpdatedAt.After(originalUpdatedAt) || employee.UpdatedAt.Equal(originalUpdatedAt))
}

func TestEmployee_Update_PartialFields(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Original", "Original Role")
	employee.Personality = "Serious"
	employee.AvatarURL = "https://old.url"

	// Only update name
	employee.Update("New Name", "", "", "")

	assert.Equal(t, "New Name", employee.Name)
	assert.Equal(t, "Original Role", employee.Role)        // Unchanged
	assert.Equal(t, "Serious", employee.Personality)       // Unchanged
	assert.Equal(t, "https://old.url", employee.AvatarURL) // Unchanged
}

func TestEmployee_SetStatus(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Test", "Role")

	tests := []struct {
		status   Status
		expected Status
	}{
		{StatusWorking, StatusWorking},
		{StatusOffline, StatusOffline},
		{StatusError, StatusError},
		{StatusIdle, StatusIdle},
	}

	for _, tt := range tests {
		employee.SetStatus(tt.status)
		assert.Equal(t, tt.expected, employee.Status)
	}
}

func TestEmployee_AssignTask(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Test", "Role")
	taskID := uuid.New()

	employee.AssignTask(taskID)

	require.NotNil(t, employee.CurrentTaskID)
	assert.Equal(t, taskID, *employee.CurrentTaskID)
	assert.Equal(t, StatusWorking, employee.Status)
}

func TestEmployee_CompleteTask_Success(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Test", "Role")
	taskID := uuid.New()
	employee.AssignTask(taskID)

	employee.CompleteTask(true)

	assert.Nil(t, employee.CurrentTaskID)
	assert.Equal(t, StatusIdle, employee.Status)
	assert.Equal(t, 1, employee.TotalTasks)
	assert.Equal(t, 1.0, employee.SuccessRate) // Success rate remains 100%
}

func TestEmployee_CompleteTask_Failure(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Test", "Role")

	// Complete a few successful tasks first
	for i := 0; i < 4; i++ {
		employee.AssignTask(uuid.New())
		employee.CompleteTask(true)
	}

	// Then fail one
	employee.AssignTask(uuid.New())
	employee.CompleteTask(false)

	assert.Equal(t, 5, employee.TotalTasks)
	assert.Equal(t, 0.8, employee.SuccessRate) // 4/5 = 0.8
}

func TestEmployee_SetOffline(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Test", "Role")

	employee.SetOffline()

	assert.Equal(t, StatusOffline, employee.Status)
}

func TestEmployee_SetOnline_WithNoTask(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Test", "Role")
	employee.SetOffline()

	employee.SetOnline()

	assert.Equal(t, StatusIdle, employee.Status)
}

func TestEmployee_SetOnline_WithTask(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Test", "Role")
	taskID := uuid.New()
	employee.AssignTask(taskID)
	employee.Status = StatusOffline // Simulate going offline while working

	employee.SetOnline()

	assert.Equal(t, StatusWorking, employee.Status)
}

func TestEmployee_IsAvailable(t *testing.T) {
	employee := NewEmployee(uuid.New(), "Test", "Role")

	assert.True(t, employee.IsAvailable())

	employee.SetStatus(StatusWorking)
	assert.False(t, employee.IsAvailable())

	employee.SetStatus(StatusOffline)
	assert.False(t, employee.IsAvailable())

	employee.SetStatus(StatusError)
	assert.False(t, employee.IsAvailable())

	employee.SetStatus(StatusIdle)
	assert.True(t, employee.IsAvailable())
}

func TestIsValidStatus(t *testing.T) {
	tests := []struct {
		status   string
		expected bool
	}{
		{"idle", true},
		{"working", true},
		{"offline", true},
		{"error", true},
		{"invalid", false},
		{"", false},
		{"IDLE", false}, // Case sensitive
	}

	for _, tt := range tests {
		t.Run(tt.status, func(t *testing.T) {
			assert.Equal(t, tt.expected, IsValidStatus(tt.status))
		})
	}
}

func TestStatus_Constants(t *testing.T) {
	assert.Equal(t, Status("idle"), StatusIdle)
	assert.Equal(t, Status("working"), StatusWorking)
	assert.Equal(t, Status("offline"), StatusOffline)
	assert.Equal(t, Status("error"), StatusError)
}
