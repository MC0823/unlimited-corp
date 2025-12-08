package scheduler

import (
	"context"
	"fmt"
	"sort"
	"sync"
	"time"

	"unlimited-corp/internal/domain/employee"
	"unlimited-corp/internal/domain/task"

	"github.com/google/uuid"
)

// TaskScheduler handles task assignment to employees
type TaskScheduler struct {
	taskRepo     task.Repository
	employeeRepo employee.Repository
	mu           sync.RWMutex
	isRunning    bool
}

// NewTaskScheduler creates a new task scheduler
func NewTaskScheduler(taskRepo task.Repository, employeeRepo employee.Repository) *TaskScheduler {
	return &TaskScheduler{
		taskRepo:     taskRepo,
		employeeRepo: employeeRepo,
	}
}

// SchedulingScore represents the match score between an employee and a task
type SchedulingScore struct {
	EmployeeID uuid.UUID
	Score      float64
	Reason     string
}

// Schedule assigns a task to the most suitable employee
func (s *TaskScheduler) Schedule(ctx context.Context, t *task.Task) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 1. Get all idle employees for the company
	employees, err := s.employeeRepo.GetByStatus(ctx, t.CompanyID, employee.StatusIdle)
	if err != nil {
		return fmt.Errorf("failed to list employees: %w", err)
	}

	if len(employees) == 0 {
		// No idle employees, task stays in pending
		return nil
	}

	// 2. Calculate scores for each employee
	scores := s.calculateScores(ctx, t, employees)

	// 3. Sort by score descending
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	// 4. Assign to the best matching employee
	bestMatch := scores[0]
	t.AssignedEmployeeID = &bestMatch.EmployeeID
	t.Status = task.StatusRunning
	now := time.Now()
	t.StartedAt = &now

	// Update task in database
	if err := s.taskRepo.Update(ctx, t); err != nil {
		return fmt.Errorf("failed to update task: %w", err)
	}

	// Update employee status
	selectedEmployee, err := s.employeeRepo.GetByID(ctx, bestMatch.EmployeeID)
	if err != nil {
		return fmt.Errorf("failed to get employee: %w", err)
	}

	selectedEmployee.AssignTask(t.ID)
	if err := s.employeeRepo.Update(ctx, selectedEmployee); err != nil {
		return fmt.Errorf("failed to update employee status: %w", err)
	}

	return nil
}

// calculateScores calculates matching scores for employees
func (s *TaskScheduler) calculateScores(ctx context.Context, t *task.Task, employees []*employee.Employee) []SchedulingScore {
	scores := make([]SchedulingScore, len(employees))

	for i, emp := range employees {
		score := 0.0
		reasons := make([]string, 0)

		// 1. Check if employee has required skills (weight: 40%)
		skillMatch := s.calculateSkillMatch(ctx, t, emp)
		score += skillMatch * 0.4
		if skillMatch > 0 {
			reasons = append(reasons, fmt.Sprintf("技能匹配度: %.0f%%", skillMatch))
		}

		// 2. Load balancing based on total tasks (weight: 30%)
		loadScore := 100.0 / float64(emp.TotalTasks+1)
		score += loadScore * 0.3
		reasons = append(reasons, fmt.Sprintf("负载评分: %.1f", loadScore))

		// 3. Success rate (weight: 20%)
		successScore := emp.SuccessRate * 100
		score += successScore * 0.2
		reasons = append(reasons, fmt.Sprintf("成功率: %.0f%%", emp.SuccessRate*100))

		// 4. Priority bonus (weight: 10%)
		priorityBonus := s.getPriorityBonus(t.Priority)
		score += priorityBonus * 0.1
		reasons = append(reasons, fmt.Sprintf("优先级加成: %.0f", priorityBonus))

		scores[i] = SchedulingScore{
			EmployeeID: emp.ID,
			Score:      score,
			Reason:     fmt.Sprintf("总分: %.1f", score),
		}
	}

	return scores
}

// getPriorityBonus returns a numeric bonus based on task priority
func (s *TaskScheduler) getPriorityBonus(priority task.TaskPriority) float64 {
	switch priority {
	case task.PriorityUrgent:
		return 100.0
	case task.PriorityHigh:
		return 75.0
	case task.PriorityMedium:
		return 50.0
	case task.PriorityLow:
		return 25.0
	default:
		return 50.0
	}
}

// calculateSkillMatch checks if employee has required skills
func (s *TaskScheduler) calculateSkillMatch(ctx context.Context, _ *task.Task, emp *employee.Employee) float64 {
	// Get employee skills
	skills, err := s.employeeRepo.GetSkills(ctx, emp.ID)
	if err != nil {
		return 50.0 // Default score if can't get skills
	}

	if len(skills) == 0 {
		return 30.0 // Lower score for employees without skills
	}

	// If task doesn't require specific skills, give base score
	return 80.0
}

// ReleaseEmployee marks an employee as idle after task completion
func (s *TaskScheduler) ReleaseEmployee(ctx context.Context, employeeID uuid.UUID, success bool) error {
	emp, err := s.employeeRepo.GetByID(ctx, employeeID)
	if err != nil {
		return fmt.Errorf("failed to get employee: %w", err)
	}

	emp.CompleteTask(success)
	return s.employeeRepo.Update(ctx, emp)
}

// ProcessPendingTasks processes all pending tasks for a company
func (s *TaskScheduler) ProcessPendingTasks(ctx context.Context, companyID uuid.UUID) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Get pending tasks
	tasks, err := s.taskRepo.ListByCompanyID(ctx, companyID, 100, 0)
	if err != nil {
		return 0, fmt.Errorf("failed to list tasks: %w", err)
	}

	scheduled := 0
	for _, t := range tasks {
		if t.Status == task.StatusPending {
			if err := s.Schedule(ctx, t); err != nil {
				continue // Log error and continue with next task
			}
			scheduled++
		}
	}

	return scheduled, nil
}

// StartBackgroundScheduler starts the background scheduling loop
func (s *TaskScheduler) StartBackgroundScheduler(ctx context.Context, interval time.Duration) {
	s.mu.Lock()
	if s.isRunning {
		s.mu.Unlock()
		return
	}
	s.isRunning = true
	s.mu.Unlock()

	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				s.mu.Lock()
				s.isRunning = false
				s.mu.Unlock()
				return
			case <-ticker.C:
				// Background task scheduling is handled here
				// In a real implementation, you would iterate over all companies
			}
		}
	}()
}

// StopBackgroundScheduler stops the background scheduling loop
func (s *TaskScheduler) StopBackgroundScheduler() {
	s.mu.Lock()
	s.isRunning = false
	s.mu.Unlock()
}
