package temporal

import (
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

// WorkflowInput represents the input for content creation workflow
type WorkflowInput struct {
	TaskID      string                 `json:"taskId"`
	CompanyID   string                 `json:"companyId"`
	EmployeeID  string                 `json:"employeeId"`
	SkillCardID string                 `json:"skillCardId"`
	Parameters  map[string]interface{} `json:"parameters"`
}

// WorkflowResult represents the result of a workflow execution
type WorkflowResult struct {
	TaskID       string                 `json:"taskId"`
	Status       string                 `json:"status"`
	Output       map[string]interface{} `json:"output"`
	Error        string                 `json:"error,omitempty"`
	StartedAt    time.Time              `json:"startedAt"`
	CompletedAt  time.Time              `json:"completedAt"`
	StepsResults []StepResult           `json:"stepsResults"`
}

// StepResult represents the result of a single workflow step
type StepResult struct {
	StepID      string                 `json:"stepId"`
	StepName    string                 `json:"stepName"`
	Status      string                 `json:"status"`
	Output      map[string]interface{} `json:"output"`
	Error       string                 `json:"error,omitempty"`
	StartedAt   time.Time              `json:"startedAt"`
	CompletedAt time.Time              `json:"completedAt"`
	TokensUsed  int                    `json:"tokensUsed"`
}

// ContentCreationWorkflow orchestrates content creation tasks
func ContentCreationWorkflow(ctx workflow.Context, input WorkflowInput) (*WorkflowResult, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("Starting content creation workflow", "taskId", input.TaskID)

	result := &WorkflowResult{
		TaskID:       input.TaskID,
		Status:       "running",
		StepsResults: make([]StepResult, 0),
		StartedAt:    workflow.Now(ctx),
	}

	// Configure activity options with retry
	activityOptions := workflow.ActivityOptions{
		StartToCloseTimeout: 5 * time.Minute,
		HeartbeatTimeout:    30 * time.Second,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, activityOptions)

	// Step 1: Execute skill card
	var skillResult SkillExecutionResult
	err := workflow.ExecuteActivity(ctx, ExecuteSkillActivity, SkillExecutionInput{
		TaskID:      input.TaskID,
		SkillCardID: input.SkillCardID,
		EmployeeID:  input.EmployeeID,
		Parameters:  input.Parameters,
	}).Get(ctx, &skillResult)

	stepResult := StepResult{
		StepID:      "step_1",
		StepName:    "技能卡执行",
		StartedAt:   result.StartedAt,
		CompletedAt: workflow.Now(ctx),
	}

	if err != nil {
		stepResult.Status = "failed"
		stepResult.Error = err.Error()
		result.StepsResults = append(result.StepsResults, stepResult)
		result.Status = "failed"
		result.Error = err.Error()
		result.CompletedAt = workflow.Now(ctx)
		return result, nil
	}

	stepResult.Status = "completed"
	stepResult.Output = skillResult.Output
	stepResult.TokensUsed = skillResult.TokensUsed
	result.StepsResults = append(result.StepsResults, stepResult)

	// Step 2: Update task status
	err = workflow.ExecuteActivity(ctx, UpdateTaskStatusActivity, TaskStatusInput{
		TaskID:   input.TaskID,
		Status:   "completed",
		Progress: 100,
		Output:   skillResult.Output,
	}).Get(ctx, nil)

	if err != nil {
		logger.Warn("Failed to update task status", "error", err)
	}

	result.Status = "completed"
	result.Output = skillResult.Output
	result.CompletedAt = workflow.Now(ctx)

	logger.Info("Content creation workflow completed", "taskId", input.TaskID)
	return result, nil
}

// HotspotTrackingWorkflow tracks hotspots and generates content ideas
func HotspotTrackingWorkflow(ctx workflow.Context, input WorkflowInput) (*WorkflowResult, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("Starting hotspot tracking workflow", "taskId", input.TaskID)

	result := &WorkflowResult{
		TaskID:       input.TaskID,
		Status:       "running",
		StepsResults: make([]StepResult, 0),
		StartedAt:    workflow.Now(ctx),
	}

	activityOptions := workflow.ActivityOptions{
		StartToCloseTimeout: 10 * time.Minute,
		HeartbeatTimeout:    time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, activityOptions)

	// Step 1: Analyze hotspots
	var hotspotResult SkillExecutionResult
	err := workflow.ExecuteActivity(ctx, AnalyzeHotspotsActivity, HotspotAnalysisInput{
		Platform: input.Parameters["platform"].(string),
		Category: input.Parameters["category"].(string),
	}).Get(ctx, &hotspotResult)

	stepResult := StepResult{
		StepID:      "step_1",
		StepName:    "热点分析",
		StartedAt:   result.StartedAt,
		CompletedAt: workflow.Now(ctx),
	}

	if err != nil {
		stepResult.Status = "failed"
		stepResult.Error = err.Error()
		result.StepsResults = append(result.StepsResults, stepResult)
		result.Status = "failed"
		result.Error = err.Error()
		result.CompletedAt = workflow.Now(ctx)
		return result, nil
	}

	stepResult.Status = "completed"
	stepResult.Output = hotspotResult.Output
	result.StepsResults = append(result.StepsResults, stepResult)

	// Step 2: Generate content suggestions
	var contentResult SkillExecutionResult
	err = workflow.ExecuteActivity(ctx, GenerateContentSuggestionsActivity, ContentSuggestionInput{
		Hotspots: hotspotResult.Output,
	}).Get(ctx, &contentResult)

	step2Result := StepResult{
		StepID:      "step_2",
		StepName:    "内容建议生成",
		StartedAt:   workflow.Now(ctx),
		CompletedAt: workflow.Now(ctx),
	}

	if err != nil {
		step2Result.Status = "failed"
		step2Result.Error = err.Error()
		result.StepsResults = append(result.StepsResults, step2Result)
		result.Status = "failed"
		result.Error = err.Error()
		result.CompletedAt = workflow.Now(ctx)
		return result, nil
	}

	step2Result.Status = "completed"
	step2Result.Output = contentResult.Output
	result.StepsResults = append(result.StepsResults, step2Result)

	result.Status = "completed"
	result.Output = contentResult.Output
	result.CompletedAt = workflow.Now(ctx)

	logger.Info("Hotspot tracking workflow completed", "taskId", input.TaskID)
	return result, nil
}

// AutoOpsWorkflow handles automated operations workflow
func AutoOpsWorkflow(ctx workflow.Context, input WorkflowInput) (*WorkflowResult, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("Starting auto ops workflow", "taskId", input.TaskID)

	result := &WorkflowResult{
		TaskID:       input.TaskID,
		Status:       "running",
		StepsResults: make([]StepResult, 0),
		StartedAt:    workflow.Now(ctx),
	}

	activityOptions := workflow.ActivityOptions{
		StartToCloseTimeout: 15 * time.Minute,
		HeartbeatTimeout:    time.Minute,
		RetryPolicy: &temporal.RetryPolicy{
			InitialInterval:    time.Second,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, activityOptions)

	// Step 1: Generate content
	var generateResult SkillExecutionResult
	err := workflow.ExecuteActivity(ctx, ExecuteSkillActivity, SkillExecutionInput{
		TaskID:      input.TaskID,
		SkillCardID: input.SkillCardID,
		EmployeeID:  input.EmployeeID,
		Parameters:  input.Parameters,
	}).Get(ctx, &generateResult)

	stepResult := StepResult{
		StepID:      "step_1",
		StepName:    "内容生成",
		StartedAt:   result.StartedAt,
		CompletedAt: workflow.Now(ctx),
	}

	if err != nil {
		stepResult.Status = "failed"
		stepResult.Error = err.Error()
		result.StepsResults = append(result.StepsResults, stepResult)
		result.Status = "failed"
		result.Error = err.Error()
		result.CompletedAt = workflow.Now(ctx)
		return result, nil
	}

	stepResult.Status = "completed"
	stepResult.Output = generateResult.Output
	stepResult.TokensUsed = generateResult.TokensUsed
	result.StepsResults = append(result.StepsResults, stepResult)

	// Step 2: Publish content (mock for now)
	var publishResult map[string]interface{}
	err = workflow.ExecuteActivity(ctx, PublishContentActivity, PublishInput{
		Content:   generateResult.Output,
		Platforms: []string{"xiaohongshu"},
	}).Get(ctx, &publishResult)

	step2Result := StepResult{
		StepID:      "step_2",
		StepName:    "内容发布",
		StartedAt:   workflow.Now(ctx),
		CompletedAt: workflow.Now(ctx),
	}

	if err != nil {
		step2Result.Status = "failed"
		step2Result.Error = err.Error()
		result.StepsResults = append(result.StepsResults, step2Result)
		// Continue even if publish fails
	} else {
		step2Result.Status = "completed"
		step2Result.Output = publishResult
	}
	result.StepsResults = append(result.StepsResults, step2Result)

	result.Status = "completed"
	result.Output = generateResult.Output
	result.CompletedAt = workflow.Now(ctx)

	logger.Info("Auto ops workflow completed", "taskId", input.TaskID)
	return result, nil
}
