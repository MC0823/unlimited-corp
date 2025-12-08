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
