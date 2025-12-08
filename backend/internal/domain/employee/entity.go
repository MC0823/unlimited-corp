package employee

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Status represents the employee status
type Status string

const (
	StatusIdle    Status = "idle"
	StatusWorking Status = "working"
	StatusOffline Status = "offline"
	StatusError   Status = "error"
)

// Employee represents an employee entity
type Employee struct {
	ID            uuid.UUID       `json:"id" db:"id"`
	CompanyID     uuid.UUID       `json:"company_id" db:"company_id"`
	Name          string          `json:"name" db:"name"`
	Role          string          `json:"role" db:"role"`
	AvatarURL     string          `json:"avatar_url" db:"avatar_url"`
	Personality   string          `json:"personality" db:"personality"`
	Status        Status          `json:"status" db:"status"`
	CurrentTaskID *uuid.UUID      `json:"current_task_id,omitempty" db:"current_task_id"`
	TotalTasks    int             `json:"total_tasks" db:"total_tasks"`
	SuccessRate   float64         `json:"success_rate" db:"success_rate"`
	Settings      json.RawMessage `json:"settings" db:"settings"`
	CreatedAt     time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at" db:"updated_at"`
}

// EmployeeSkill represents the relationship between employee and skill card
type EmployeeSkill struct {
	ID          uuid.UUID `json:"id" db:"id"`
	EmployeeID  uuid.UUID `json:"employee_id" db:"employee_id"`
	SkillCardID uuid.UUID `json:"skill_card_id" db:"skill_card_id"`
	Proficiency float64   `json:"proficiency" db:"proficiency"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// NewEmployee creates a new employee
func NewEmployee(companyID uuid.UUID, name, role string) *Employee {
	return &Employee{
		ID:          uuid.New(),
		CompanyID:   companyID,
		Name:        name,
		Role:        role,
		Status:      StatusIdle,
		TotalTasks:  0,
		SuccessRate: 1.0,
		Settings:    json.RawMessage(`{}`),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
}

// Update updates employee fields
func (e *Employee) Update(name, role, personality, avatarURL string) {
	if name != "" {
		e.Name = name
	}
	if role != "" {
		e.Role = role
	}
	if personality != "" {
		e.Personality = personality
	}
	if avatarURL != "" {
		e.AvatarURL = avatarURL
	}
	e.UpdatedAt = time.Now()
}

// SetStatus sets the employee status
func (e *Employee) SetStatus(status Status) {
	e.Status = status
	e.UpdatedAt = time.Now()
}

// AssignTask assigns a task to the employee
func (e *Employee) AssignTask(taskID uuid.UUID) {
	e.CurrentTaskID = &taskID
	e.Status = StatusWorking
	e.UpdatedAt = time.Now()
}

// CompleteTask marks the current task as completed
func (e *Employee) CompleteTask(success bool) {
	e.CurrentTaskID = nil
	e.Status = StatusIdle
	e.TotalTasks++
	if !success {
		// Recalculate success rate
		successCount := int(e.SuccessRate * float64(e.TotalTasks-1))
		e.SuccessRate = float64(successCount) / float64(e.TotalTasks)
	}
	e.UpdatedAt = time.Now()
}

// SetOffline sets the employee to offline status
func (e *Employee) SetOffline() {
	e.Status = StatusOffline
	e.UpdatedAt = time.Now()
}

// SetOnline sets the employee back to idle status
func (e *Employee) SetOnline() {
	if e.CurrentTaskID != nil {
		e.Status = StatusWorking
	} else {
		e.Status = StatusIdle
	}
	e.UpdatedAt = time.Now()
}

// IsAvailable checks if the employee is available for work
func (e *Employee) IsAvailable() bool {
	return e.Status == StatusIdle
}

// IsValidStatus checks if the status is valid
func IsValidStatus(status string) bool {
	switch Status(status) {
	case StatusIdle, StatusWorking, StatusOffline, StatusError:
		return true
	}
	return false
}
