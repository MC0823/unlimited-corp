package persistence

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"unlimited-corp/internal/domain/task"
	"unlimited-corp/pkg/errors"
)

type TaskRepository struct {
	db *sqlx.DB
}

func NewTaskRepository(db *sqlx.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(ctx context.Context, t *task.Task) error {
	workflow, _ := json.Marshal(t.WorkflowDefinition)
	inputData, _ := json.Marshal(t.InputData)
	outputData, _ := json.Marshal(t.OutputData)

	query := `
		INSERT INTO tasks (id, company_id, title, description, priority, status, progress,
			workflow_definition, assigned_employee_id, input_data, output_data, error_message,
			started_at, completed_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
	`
	_, err := r.db.ExecContext(ctx, query,
		t.ID, t.CompanyID, t.Title, t.Description, t.Priority, t.Status, t.Progress,
		workflow, t.AssignedEmployeeID, inputData, outputData, t.ErrorMessage,
		t.StartedAt, t.CompletedAt, t.CreatedAt, t.UpdatedAt,
	)
	if err != nil {
		return errors.Wrap(err, "failed to create task")
	}
	return nil
}

func (r *TaskRepository) GetByID(ctx context.Context, id uuid.UUID) (*task.Task, error) {
	query := `
		SELECT id, company_id, title, description, priority, status, progress,
			workflow_definition, assigned_employee_id, input_data, output_data, error_message,
			started_at, completed_at, created_at, updated_at
		FROM tasks WHERE id = $1
	`
	var t task.Task
	var workflow, inputData, outputData []byte
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&t.ID, &t.CompanyID, &t.Title, &t.Description, &t.Priority, &t.Status, &t.Progress,
		&workflow, &t.AssignedEmployeeID, &inputData, &outputData, &t.ErrorMessage,
		&t.StartedAt, &t.CompletedAt, &t.CreatedAt, &t.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, errors.ErrNotFound
	}
	if err != nil {
		return nil, errors.Wrap(err, "failed to get task")
	}

	json.Unmarshal(workflow, &t.WorkflowDefinition)
	json.Unmarshal(inputData, &t.InputData)
	json.Unmarshal(outputData, &t.OutputData)
	return &t, nil
}

func (r *TaskRepository) ListByCompanyID(ctx context.Context, companyID uuid.UUID, limit, offset int) ([]*task.Task, error) {
	query := `
		SELECT id, company_id, title, description, priority, status, progress,
			workflow_definition, assigned_employee_id, input_data, output_data, error_message,
			started_at, completed_at, created_at, updated_at
		FROM tasks WHERE company_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, companyID, limit, offset)
	if err != nil {
		return nil, errors.Wrap(err, "failed to list tasks")
	}
	defer rows.Close()

	var tasks []*task.Task
	for rows.Next() {
		var t task.Task
		var workflow, inputData, outputData []byte
		err := rows.Scan(
			&t.ID, &t.CompanyID, &t.Title, &t.Description, &t.Priority, &t.Status, &t.Progress,
			&workflow, &t.AssignedEmployeeID, &inputData, &outputData, &t.ErrorMessage,
			&t.StartedAt, &t.CompletedAt, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, errors.Wrap(err, "failed to scan task")
		}
		json.Unmarshal(workflow, &t.WorkflowDefinition)
		json.Unmarshal(inputData, &t.InputData)
		json.Unmarshal(outputData, &t.OutputData)
		tasks = append(tasks, &t)
	}
	return tasks, nil
}

func (r *TaskRepository) Update(ctx context.Context, t *task.Task) error {
	workflow, _ := json.Marshal(t.WorkflowDefinition)
	inputData, _ := json.Marshal(t.InputData)
	outputData, _ := json.Marshal(t.OutputData)

	query := `
		UPDATE tasks
		SET title = $1, description = $2, priority = $3, status = $4, progress = $5,
			workflow_definition = $6, assigned_employee_id = $7, input_data = $8,
			output_data = $9, error_message = $10, started_at = $11, completed_at = $12, updated_at = $13
		WHERE id = $14
	`
	result, err := r.db.ExecContext(ctx, query,
		t.Title, t.Description, t.Priority, t.Status, t.Progress,
		workflow, t.AssignedEmployeeID, inputData, outputData, t.ErrorMessage,
		t.StartedAt, t.CompletedAt, t.UpdatedAt, t.ID,
	)
	if err != nil {
		return errors.Wrap(err, "failed to update task")
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.ErrNotFound
	}
	return nil
}

func (r *TaskRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM tasks WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return errors.Wrap(err, "failed to delete task")
	}

	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.ErrNotFound
	}
	return nil
}
