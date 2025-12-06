package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/employee"
	"unlimited-corp/internal/infrastructure/database"
)

// EmployeeRepository implements the employee.Repository interface
type EmployeeRepository struct {
	db *database.DB
}

// NewEmployeeRepository creates a new employee repository
func NewEmployeeRepository(db *database.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

// Create creates a new employee
func (r *EmployeeRepository) Create(ctx context.Context, e *employee.Employee) error {
	query := `
		INSERT INTO employees (
			id, company_id, name, role, avatar_url, personality,
			status, current_task_id, total_tasks, success_rate, settings,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`

	_, err := r.db.ExecContext(ctx, query,
		e.ID, e.CompanyID, e.Name, e.Role, e.AvatarURL, e.Personality,
		e.Status, e.CurrentTaskID, e.TotalTasks, e.SuccessRate, e.Settings,
		e.CreatedAt, e.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create employee: %w", err)
	}

	return nil
}

// GetByID retrieves an employee by ID
func (r *EmployeeRepository) GetByID(ctx context.Context, id uuid.UUID) (*employee.Employee, error) {
	query := `SELECT * FROM employees WHERE id = $1`

	var e employee.Employee
	if err := r.db.GetContext(ctx, &e, query, id); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}

	return &e, nil
}

// GetByCompanyID retrieves all employees for a company
func (r *EmployeeRepository) GetByCompanyID(ctx context.Context, companyID uuid.UUID) ([]*employee.Employee, error) {
	query := `SELECT * FROM employees WHERE company_id = $1 ORDER BY name ASC`

	var employees []*employee.Employee
	if err := r.db.SelectContext(ctx, &employees, query, companyID); err != nil {
		return nil, fmt.Errorf("failed to get employees by company: %w", err)
	}

	return employees, nil
}

// GetAvailable retrieves all available employees for a company
func (r *EmployeeRepository) GetAvailable(ctx context.Context, companyID uuid.UUID) ([]*employee.Employee, error) {
	query := `SELECT * FROM employees WHERE company_id = $1 AND status = 'idle' ORDER BY success_rate DESC`

	var employees []*employee.Employee
	if err := r.db.SelectContext(ctx, &employees, query, companyID); err != nil {
		return nil, fmt.Errorf("failed to get available employees: %w", err)
	}

	return employees, nil
}

// Update updates an existing employee
func (r *EmployeeRepository) Update(ctx context.Context, e *employee.Employee) error {
	query := `
		UPDATE employees SET
			name = $1, role = $2, avatar_url = $3, personality = $4,
			status = $5, current_task_id = $6, total_tasks = $7, success_rate = $8,
			settings = $9, updated_at = $10
		WHERE id = $11
	`

	result, err := r.db.ExecContext(ctx, query,
		e.Name, e.Role, e.AvatarURL, e.Personality,
		e.Status, e.CurrentTaskID, e.TotalTasks, e.SuccessRate,
		e.Settings, time.Now(), e.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update employee: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("employee not found")
	}

	return nil
}

// Delete deletes an employee by ID
func (r *EmployeeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM employees WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete employee: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("employee not found")
	}

	return nil
}

// AssignSkill assigns a skill card to an employee
func (r *EmployeeRepository) AssignSkill(ctx context.Context, employeeID, skillCardID uuid.UUID, proficiency float64) error {
	query := `
		INSERT INTO employee_skills (id, employee_id, skill_card_id, proficiency, created_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (employee_id, skill_card_id) DO UPDATE SET proficiency = $4
	`

	_, err := r.db.ExecContext(ctx, query,
		uuid.New(), employeeID, skillCardID, proficiency, time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to assign skill: %w", err)
	}

	return nil
}

// RemoveSkill removes a skill card from an employee
func (r *EmployeeRepository) RemoveSkill(ctx context.Context, employeeID, skillCardID uuid.UUID) error {
	query := `DELETE FROM employee_skills WHERE employee_id = $1 AND skill_card_id = $2`

	_, err := r.db.ExecContext(ctx, query, employeeID, skillCardID)
	if err != nil {
		return fmt.Errorf("failed to remove skill: %w", err)
	}

	return nil
}

// GetSkills retrieves all skill card IDs assigned to an employee
func (r *EmployeeRepository) GetSkills(ctx context.Context, employeeID uuid.UUID) ([]*employee.EmployeeSkill, error) {
	query := `SELECT * FROM employee_skills WHERE employee_id = $1`

	var skills []*employee.EmployeeSkill
	if err := r.db.SelectContext(ctx, &skills, query, employeeID); err != nil {
		return nil, fmt.Errorf("failed to get employee skills: %w", err)
	}

	return skills, nil
}

// GetByStatus retrieves employees by status
func (r *EmployeeRepository) GetByStatus(ctx context.Context, companyID uuid.UUID, status employee.Status) ([]*employee.Employee, error) {
	query := `SELECT * FROM employees WHERE company_id = $1 AND status = $2 ORDER BY name ASC`

	var employees []*employee.Employee
	if err := r.db.SelectContext(ctx, &employees, query, companyID, status); err != nil {
		return nil, fmt.Errorf("failed to get employees by status: %w", err)
	}

	return employees, nil
}

// CountByCompany counts the number of employees for a company
func (r *EmployeeRepository) CountByCompany(ctx context.Context, companyID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM employees WHERE company_id = $1`

	var count int
	if err := r.db.GetContext(ctx, &count, query, companyID); err != nil {
		return 0, fmt.Errorf("failed to count employees: %w", err)
	}

	return count, nil
}

// Ensure implementation matches interface
var _ employee.Repository = (*EmployeeRepository)(nil)
