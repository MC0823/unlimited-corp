package employee

import (
	"context"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/employee"
	"unlimited-corp/pkg/errors"
)

// Service handles employee business logic
type Service struct {
	repo employee.Repository
}

// NewService creates a new employee service
func NewService(repo employee.Repository) *Service {
	return &Service{repo: repo}
}

// CreateInput represents the input for creating an employee
type CreateInput struct {
	CompanyID   uuid.UUID `json:"-"`
	Name        string    `json:"name" binding:"required,min=2,max=100"`
	Role        string    `json:"role" binding:"required,min=2,max=100"`
	AvatarURL   string    `json:"avatar_url"`
	Personality string    `json:"personality"`
}

// Create creates a new employee
func (s *Service) Create(ctx context.Context, input *CreateInput) (*employee.Employee, error) {
	emp := employee.NewEmployee(input.CompanyID, input.Name, input.Role)

	if input.AvatarURL != "" {
		emp.AvatarURL = input.AvatarURL
	}
	if input.Personality != "" {
		emp.Personality = input.Personality
	}

	if err := s.repo.Create(ctx, emp); err != nil {
		return nil, errors.Wrap(err, "failed to create employee")
	}

	return emp, nil
}

// GetByID retrieves an employee by ID
func (s *Service) GetByID(ctx context.Context, id uuid.UUID) (*employee.Employee, error) {
	emp, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get employee")
	}
	if emp == nil {
		return nil, errors.ErrNotFound
	}

	return emp, nil
}

// List retrieves all employees for a company
func (s *Service) List(ctx context.Context, companyID uuid.UUID) ([]*employee.Employee, error) {
	employees, err := s.repo.GetByCompanyID(ctx, companyID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to list employees")
	}

	return employees, nil
}

// ListAvailable retrieves all available employees for a company
func (s *Service) ListAvailable(ctx context.Context, companyID uuid.UUID) ([]*employee.Employee, error) {
	employees, err := s.repo.GetAvailable(ctx, companyID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to list available employees")
	}

	return employees, nil
}

// UpdateInput represents the input for updating an employee
type UpdateInput struct {
	ID          uuid.UUID `json:"-"`
	CompanyID   uuid.UUID `json:"-"`
	Name        string    `json:"name"`
	Role        string    `json:"role"`
	AvatarURL   string    `json:"avatar_url"`
	Personality string    `json:"personality"`
}

// Update updates an existing employee
func (s *Service) Update(ctx context.Context, input *UpdateInput) (*employee.Employee, error) {
	emp, err := s.repo.GetByID(ctx, input.ID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get employee")
	}
	if emp == nil {
		return nil, errors.ErrNotFound
	}

	emp.Update(input.Name, input.Role, input.Personality, input.AvatarURL)

	if err := s.repo.Update(ctx, emp); err != nil {
		return nil, errors.Wrap(err, "failed to update employee")
	}

	return emp, nil
}

// Delete deletes an employee
func (s *Service) Delete(ctx context.Context, id, companyID uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return errors.Wrap(err, "failed to delete employee")
	}

	return nil
}

// AssignSkillInput represents the input for assigning a skill
type AssignSkillInput struct {
	EmployeeID  uuid.UUID `json:"-"`
	CompanyID   uuid.UUID `json:"-"`
	SkillCardID uuid.UUID `json:"skill_card_id" binding:"required"`
	Proficiency float64   `json:"proficiency"`
}

// AssignSkill assigns a skill card to an employee
func (s *Service) AssignSkill(ctx context.Context, input *AssignSkillInput) error {
	proficiency := input.Proficiency
	if proficiency <= 0 || proficiency > 1 {
		proficiency = 1.0
	}

	if err := s.repo.AssignSkill(ctx, input.EmployeeID, input.SkillCardID, proficiency); err != nil {
		return errors.Wrap(err, "failed to assign skill")
	}

	return nil
}

// RemoveSkill removes a skill card from an employee
func (s *Service) RemoveSkill(ctx context.Context, employeeID, skillCardID, companyID uuid.UUID) error {
	if err := s.repo.RemoveSkill(ctx, employeeID, skillCardID); err != nil {
		return errors.Wrap(err, "failed to remove skill")
	}

	return nil
}

// GetSkills retrieves all skills for an employee
func (s *Service) GetSkills(ctx context.Context, employeeID uuid.UUID) ([]*employee.EmployeeSkill, error) {
	skills, err := s.repo.GetSkills(ctx, employeeID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get skills")
	}

	return skills, nil
}

// SetStatus sets the status of an employee
func (s *Service) SetStatus(ctx context.Context, id, companyID uuid.UUID, status string) (*employee.Employee, error) {
	if !employee.IsValidStatus(status) {
		return nil, errors.New(400, "invalid status")
	}

	emp, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.Wrap(err, "failed to get employee")
	}
	if emp == nil {
		return nil, errors.ErrNotFound
	}

	emp.SetStatus(employee.Status(status))

	if err := s.repo.Update(ctx, emp); err != nil {
		return nil, errors.Wrap(err, "failed to update employee status")
	}

	return emp, nil
}
