package task

import (
	"time"

	"github.com/google/uuid"
)

type TaskStatus string

const (
	StatusPending   TaskStatus = "pending"
	StatusRunning   TaskStatus = "running"
	StatusPaused    TaskStatus = "paused"
	StatusCompleted TaskStatus = "completed"
	StatusFailed    TaskStatus = "failed"
	StatusCancelled TaskStatus = "cancelled"
)

type TaskPriority string

const (
	PriorityLow    TaskPriority = "low"
	PriorityMedium TaskPriority = "medium"
	PriorityHigh   TaskPriority = "high"
	PriorityUrgent TaskPriority = "urgent"
)

type Task struct {
	ID                 uuid.UUID              `json:"id"`
	CompanyID          uuid.UUID              `json:"company_id"`
	Title              string                 `json:"title"`
	Description        string                 `json:"description"`
	Priority           TaskPriority           `json:"priority"`
	Status             TaskStatus             `json:"status"`
	Progress           int                    `json:"progress"`
	WorkflowDefinition map[string]interface{} `json:"workflow_definition"`
	AssignedEmployeeID *uuid.UUID             `json:"assigned_employee_id"`
	InputData          map[string]interface{} `json:"input_data"`
	OutputData         map[string]interface{} `json:"output_data"`
	ErrorMessage       string                 `json:"error_message"`
	StartedAt          *time.Time             `json:"started_at"`
	CompletedAt        *time.Time             `json:"completed_at"`
	CreatedAt          time.Time              `json:"created_at"`
	UpdatedAt          time.Time              `json:"updated_at"`
}

func NewTask(companyID uuid.UUID, title, description string, priority TaskPriority) *Task {
	return &Task{
		ID:          uuid.New(),
		CompanyID:   companyID,
		Title:       title,
		Description: description,
		Priority:    priority,
		Status:      StatusPending,
		Progress:    0,
		InputData:   make(map[string]interface{}),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

// Start starts the task with assigned employee
func (t *Task) Start(employeeID uuid.UUID) {
	now := time.Now()
	t.Status = StatusRunning
	t.AssignedEmployeeID = &employeeID
	t.StartedAt = &now
	t.UpdatedAt = now
}

// UpdateProgress updates task progress (0-100)
func (t *Task) UpdateProgress(progress int) {
	if progress < 0 {
		progress = 0
	}
	if progress > 100 {
		progress = 100
	}
	t.Progress = progress
	t.UpdatedAt = time.Now()
}

// Complete marks task as completed
func (t *Task) Complete(output map[string]interface{}) {
	now := time.Now()
	t.Status = StatusCompleted
	t.Progress = 100
	t.OutputData = output
	t.CompletedAt = &now
	t.UpdatedAt = now
}

// Fail marks task as failed
func (t *Task) Fail(errorMsg string) {
	now := time.Now()
	t.Status = StatusFailed
	t.ErrorMessage = errorMsg
	t.CompletedAt = &now
	t.UpdatedAt = now
}

// Cancel cancels the task
func (t *Task) Cancel() {
	now := time.Now()
	t.Status = StatusCancelled
	t.CompletedAt = &now
	t.UpdatedAt = now
}

// Pause pauses the task
func (t *Task) Pause() {
	t.Status = StatusPaused
	t.UpdatedAt = time.Now()
}

// Resume resumes a paused task
func (t *Task) Resume() {
	t.Status = StatusRunning
	t.UpdatedAt = time.Now()
}

// IsActive returns true if task is currently running
func (t *Task) IsActive() bool {
	return t.Status == StatusRunning
}

// CanTransitionTo checks if status transition is valid
func (t *Task) CanTransitionTo(status TaskStatus) bool {
	switch t.Status {
	case StatusPending:
		return status == StatusRunning || status == StatusCancelled
	case StatusRunning:
		return status == StatusCompleted || status == StatusFailed ||
			status == StatusPaused || status == StatusCancelled
	case StatusPaused:
		return status == StatusRunning || status == StatusCancelled
	case StatusCompleted, StatusFailed, StatusCancelled:
		return false // Terminal states
	}
	return false
}

// Duration returns task duration if completed
func (t *Task) Duration() time.Duration {
	if t.StartedAt == nil {
		return 0
	}
	if t.CompletedAt != nil {
		return t.CompletedAt.Sub(*t.StartedAt)
	}
	return time.Since(*t.StartedAt)
}

// SetInputData sets the input data
func (t *Task) SetInputData(data map[string]interface{}) {
	t.InputData = data
	t.UpdatedAt = time.Now()
}
