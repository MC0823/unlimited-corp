package employee

import (
	"context"

	"github.com/google/uuid"
)

// Repository defines the interface for employee data access
type Repository interface {
	// Create creates a new employee
	Create(ctx context.Context, employee *Employee) error

	// GetByID retrieves an employee by ID
	GetByID(ctx context.Context, id uuid.UUID) (*Employee, error)

	// GetByCompanyID retrieves all employees for a company
	GetByCompanyID(ctx context.Context, companyID uuid.UUID) ([]*Employee, error)

	// GetAvailable retrieves all available employees for a company
	GetAvailable(ctx context.Context, companyID uuid.UUID) ([]*Employee, error)

	// Update updates an existing employee
	Update(ctx context.Context, employee *Employee) error

	// Delete deletes an employee by ID
	Delete(ctx context.Context, id uuid.UUID) error

	// AssignSkill assigns a skill card to an employee
	AssignSkill(ctx context.Context, employeeID, skillCardID uuid.UUID, proficiency float64) error

	// RemoveSkill removes a skill card from an employee
	RemoveSkill(ctx context.Context, employeeID, skillCardID uuid.UUID) error

	// GetSkills retrieves all skill card IDs assigned to an employee
	GetSkills(ctx context.Context, employeeID uuid.UUID) ([]*EmployeeSkill, error)

	// GetByStatus retrieves employees by status
	GetByStatus(ctx context.Context, companyID uuid.UUID, status Status) ([]*Employee, error)

	// CountByCompany counts the number of employees for a company
	CountByCompany(ctx context.Context, companyID uuid.UUID) (int, error)
}
