package task

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewTask(t *testing.T) {
	companyID := uuid.New()
	title := "Test Task"
	description := "Task description"
	priority := PriorityMedium

	task := NewTask(companyID, title, description, priority)

	require.NotNil(t, task)
	assert.NotEqual(t, uuid.Nil, task.ID)
	assert.Equal(t, companyID, task.CompanyID)
	assert.Equal(t, title, task.Title)
	assert.Equal(t, description, task.Description)
	assert.Equal(t, priority, task.Priority)
	assert.Equal(t, StatusPending, task.Status)
	assert.Equal(t, 0, task.Progress)
	assert.NotNil(t, task.InputData)
	assert.Nil(t, task.AssignedEmployeeID)
	assert.False(t, task.CreatedAt.IsZero())
	assert.False(t, task.UpdatedAt.IsZero())
}

func TestTask_Start(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityHigh)
	employeeID := uuid.New()

	task.Start(employeeID)

	assert.Equal(t, StatusRunning, task.Status)
	require.NotNil(t, task.AssignedEmployeeID)
	assert.Equal(t, employeeID, *task.AssignedEmployeeID)
	require.NotNil(t, task.StartedAt)
}

func TestTask_UpdateProgress(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityLow)
	task.Start(uuid.New())

	tests := []struct {
		name     string
		progress int
		expected int
	}{
		{"normal progress", 50, 50},
		{"max progress", 100, 100},
		{"over max", 150, 100},
		{"negative", -10, 0},
		{"zero", 0, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			task.UpdateProgress(tt.progress)
			assert.Equal(t, tt.expected, task.Progress)
		})
	}
}

func TestTask_Complete(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)
	task.Start(uuid.New())

	output := map[string]interface{}{"result": "success"}
	task.Complete(output)

	assert.Equal(t, StatusCompleted, task.Status)
	assert.Equal(t, 100, task.Progress)
	require.NotNil(t, task.CompletedAt)
	assert.Equal(t, output, task.OutputData)
}

func TestTask_Fail(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)
	task.Start(uuid.New())

	errorMsg := "Something went wrong"
	task.Fail(errorMsg)

	assert.Equal(t, StatusFailed, task.Status)
	assert.Equal(t, errorMsg, task.ErrorMessage)
	require.NotNil(t, task.CompletedAt)
}

func TestTask_Cancel(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)

	task.Cancel()

	assert.Equal(t, StatusCancelled, task.Status)
	require.NotNil(t, task.CompletedAt)
}

func TestTask_Pause(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)
	task.Start(uuid.New())

	task.Pause()

	assert.Equal(t, StatusPaused, task.Status)
}

func TestTask_Resume(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)
	task.Start(uuid.New())
	task.Pause()

	task.Resume()

	assert.Equal(t, StatusRunning, task.Status)
}

func TestTask_IsActive(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)

	// Pending is not active
	assert.False(t, task.IsActive())

	// Running is active
	task.Start(uuid.New())
	assert.True(t, task.IsActive())

	// Paused is not active
	task.Pause()
	assert.False(t, task.IsActive())

	// Resume makes it active again
	task.Resume()
	assert.True(t, task.IsActive())
}

func TestTask_CanTransitionTo(t *testing.T) {
	tests := []struct {
		name     string
		from     TaskStatus
		to       TaskStatus
		expected bool
	}{
		{"pending to running", StatusPending, StatusRunning, true},
		{"pending to cancelled", StatusPending, StatusCancelled, true},
		{"running to completed", StatusRunning, StatusCompleted, true},
		{"running to failed", StatusRunning, StatusFailed, true},
		{"running to paused", StatusRunning, StatusPaused, true},
		{"paused to running", StatusPaused, StatusRunning, true},
		{"completed to running", StatusCompleted, StatusRunning, false},
		{"failed to running", StatusFailed, StatusRunning, false},
		{"cancelled to running", StatusCancelled, StatusRunning, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)
			task.Status = tt.from
			assert.Equal(t, tt.expected, task.CanTransitionTo(tt.to))
		})
	}
}

func TestTaskStatus_Constants(t *testing.T) {
	assert.Equal(t, TaskStatus("pending"), StatusPending)
	assert.Equal(t, TaskStatus("running"), StatusRunning)
	assert.Equal(t, TaskStatus("paused"), StatusPaused)
	assert.Equal(t, TaskStatus("completed"), StatusCompleted)
	assert.Equal(t, TaskStatus("failed"), StatusFailed)
	assert.Equal(t, TaskStatus("cancelled"), StatusCancelled)
}

func TestTaskPriority_Constants(t *testing.T) {
	assert.Equal(t, TaskPriority("low"), PriorityLow)
	assert.Equal(t, TaskPriority("medium"), PriorityMedium)
	assert.Equal(t, TaskPriority("high"), PriorityHigh)
	assert.Equal(t, TaskPriority("urgent"), PriorityUrgent)
}

func TestTask_Duration(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)
	task.Start(uuid.New())

	// Wait a short moment
	time.Sleep(10 * time.Millisecond)

	task.Complete(nil)

	duration := task.Duration()
	assert.True(t, duration >= 10*time.Millisecond)
}

func TestTask_SetInputData(t *testing.T) {
	task := NewTask(uuid.New(), "Test", "Desc", PriorityMedium)

	input := map[string]interface{}{
		"key1": "value1",
		"key2": 123,
	}

	task.SetInputData(input)

	assert.Equal(t, input, task.InputData)
}
