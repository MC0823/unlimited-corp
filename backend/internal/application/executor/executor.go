package executor

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"unlimited-corp/internal/domain/skillcard"

	"github.com/google/uuid"
)

// ExecutionResult represents the result of skill execution
type ExecutionResult struct {
	Success    bool            `json:"success"`
	Output     json.RawMessage `json:"output,omitempty"`
	Error      string          `json:"error,omitempty"`
	Duration   time.Duration   `json:"duration"`
	TokensUsed int             `json:"tokens_used,omitempty"`
	ExecutedAt time.Time       `json:"executed_at"`
}

// ExecutionContext contains context for skill execution
type ExecutionContext struct {
	TaskID      uuid.UUID              `json:"task_id"`
	EmployeeID  uuid.UUID              `json:"employee_id"`
	SkillCardID uuid.UUID              `json:"skill_card_id"`
	Input       map[string]interface{} `json:"input"`
	Timeout     time.Duration          `json:"timeout"`
}

// AIProvider represents an AI provider interface
type AIProvider interface {
	Complete(ctx context.Context, prompt string, config AIConfig) (*AIResponse, error)
	Name() string
}

// AIConfig holds AI provider configuration
type AIConfig struct {
	Model       string  `json:"model"`
	MaxTokens   int     `json:"max_tokens"`
	Temperature float64 `json:"temperature"`
	TopP        float64 `json:"top_p,omitempty"`
}

// AIResponse holds AI provider response
type AIResponse struct {
	Content    string `json:"content"`
	TokensUsed int    `json:"tokens_used"`
	Model      string `json:"model"`
}

// SkillExecutor executes skill cards
type SkillExecutor struct {
	skillCardRepo skillcard.Repository
	aiProviders   map[string]AIProvider
	mu            sync.RWMutex
}

// NewSkillExecutor creates a new skill executor
func NewSkillExecutor(repo skillcard.Repository) *SkillExecutor {
	return &SkillExecutor{
		skillCardRepo: repo,
		aiProviders:   make(map[string]AIProvider),
	}
}

// RegisterAIProvider registers an AI provider
func (e *SkillExecutor) RegisterAIProvider(provider AIProvider) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.aiProviders[provider.Name()] = provider
}

// Execute executes a skill card with the given context
func (e *SkillExecutor) Execute(ctx context.Context, execCtx *ExecutionContext) (*ExecutionResult, error) {
	startTime := time.Now()

	// Get skill card
	skillCard, err := e.skillCardRepo.GetByID(ctx, execCtx.SkillCardID)
	if err != nil {
		return &ExecutionResult{
			Success:    false,
			Error:      fmt.Sprintf("failed to get skill card: %v", err),
			Duration:   time.Since(startTime),
			ExecutedAt: time.Now(),
		}, err
	}

	// Set default timeout
	if execCtx.Timeout == 0 {
		execCtx.Timeout = 5 * time.Minute
	}

	// Create timeout context
	timeoutCtx, cancel := context.WithTimeout(ctx, execCtx.Timeout)
	defer cancel()

	// Execute based on kernel type
	var result *ExecutionResult
	switch skillCard.KernelType {
	case skillcard.KernelTypeAIModel:
		result, err = e.executeAIModel(timeoutCtx, skillCard, execCtx)
	case skillcard.KernelTypeCodeLogic:
		result, err = e.executeCodeLogic(timeoutCtx, skillCard, execCtx)
	case skillcard.KernelTypeHybrid:
		result, err = e.executeHybrid(timeoutCtx, skillCard, execCtx)
	default:
		return nil, fmt.Errorf("unsupported kernel type: %s", skillCard.KernelType)
	}

	if err != nil {
		return &ExecutionResult{
			Success:    false,
			Error:      err.Error(),
			Duration:   time.Since(startTime),
			ExecutedAt: time.Now(),
		}, err
	}

	result.Duration = time.Since(startTime)
	result.ExecutedAt = time.Now()

	// Update skill card usage stats
	skillCard.IncrementUsage(result.Success)
	_ = e.skillCardRepo.Update(ctx, skillCard)

	return result, nil
}

// executeAIModel executes an AI model based skill
func (e *SkillExecutor) executeAIModel(ctx context.Context, skill *skillcard.SkillCard, execCtx *ExecutionContext) (*ExecutionResult, error) {
	// Parse kernel config
	var config struct {
		Provider    string  `json:"provider"`
		Model       string  `json:"model"`
		MaxTokens   int     `json:"max_tokens"`
		Temperature float64 `json:"temperature"`
		Prompt      string  `json:"prompt"`
	}

	if err := json.Unmarshal(skill.KernelConfig, &config); err != nil {
		return nil, fmt.Errorf("failed to parse kernel config: %w", err)
	}

	// Get AI provider
	e.mu.RLock()
	provider, ok := e.aiProviders[config.Provider]
	e.mu.RUnlock()

	if !ok {
		return nil, fmt.Errorf("AI provider not found: %s", config.Provider)
	}

	// Build prompt with input
	prompt := e.buildPrompt(config.Prompt, execCtx.Input)

	// Call AI provider
	aiConfig := AIConfig{
		Model:       config.Model,
		MaxTokens:   config.MaxTokens,
		Temperature: config.Temperature,
	}

	response, err := provider.Complete(ctx, prompt, aiConfig)
	if err != nil {
		return nil, fmt.Errorf("AI execution failed: %w", err)
	}

	// Build output
	output, _ := json.Marshal(map[string]interface{}{
		"content": response.Content,
		"model":   response.Model,
	})

	return &ExecutionResult{
		Success:    true,
		Output:     output,
		TokensUsed: response.TokensUsed,
	}, nil
}

// executeCodeLogic executes code-based logic
func (e *SkillExecutor) executeCodeLogic(ctx context.Context, skill *skillcard.SkillCard, execCtx *ExecutionContext) (*ExecutionResult, error) {
	// Parse kernel config
	var config struct {
		Handler string                 `json:"handler"`
		Params  map[string]interface{} `json:"params"`
	}

	if err := json.Unmarshal(skill.KernelConfig, &config); err != nil {
		return nil, fmt.Errorf("failed to parse kernel config: %w", err)
	}

	// Execute based on handler type
	var result interface{}
	var err error

	switch config.Handler {
	case "data_analysis":
		result, err = e.handleDataAnalysis(ctx, execCtx.Input, config.Params)
	case "report_generation":
		result, err = e.handleReportGeneration(ctx, execCtx.Input, config.Params)
	case "web_scraping":
		result, err = e.handleWebScraping(ctx, execCtx.Input, config.Params)
	case "email_send":
		result, err = e.handleEmailSend(ctx, execCtx.Input, config.Params)
	default:
		return nil, fmt.Errorf("unknown handler: %s", config.Handler)
	}

	if err != nil {
		return nil, err
	}

	output, _ := json.Marshal(result)

	return &ExecutionResult{
		Success: true,
		Output:  output,
	}, nil
}

// executeHybrid executes hybrid logic (AI + code)
func (e *SkillExecutor) executeHybrid(ctx context.Context, skill *skillcard.SkillCard, execCtx *ExecutionContext) (*ExecutionResult, error) {
	// Parse kernel config
	var config struct {
		Steps []struct {
			Type   string          `json:"type"` // "ai" or "code"
			Config json.RawMessage `json:"config"`
		} `json:"steps"`
	}

	if err := json.Unmarshal(skill.KernelConfig, &config); err != nil {
		return nil, fmt.Errorf("failed to parse kernel config: %w", err)
	}

	// Execute steps in sequence
	currentInput := execCtx.Input
	totalTokens := 0

	for i, step := range config.Steps {
		var stepResult *ExecutionResult
		var err error

		// Create a temporary skill for the step
		tempSkill := &skillcard.SkillCard{
			KernelConfig: step.Config,
		}

		stepCtx := &ExecutionContext{
			TaskID:      execCtx.TaskID,
			EmployeeID:  execCtx.EmployeeID,
			SkillCardID: execCtx.SkillCardID,
			Input:       currentInput,
			Timeout:     execCtx.Timeout,
		}

		switch step.Type {
		case "ai":
			tempSkill.KernelType = skillcard.KernelTypeAIModel
			stepResult, err = e.executeAIModel(ctx, tempSkill, stepCtx)
		case "code":
			tempSkill.KernelType = skillcard.KernelTypeCodeLogic
			stepResult, err = e.executeCodeLogic(ctx, tempSkill, stepCtx)
		default:
			return nil, fmt.Errorf("unknown step type at step %d: %s", i, step.Type)
		}

		if err != nil {
			return nil, fmt.Errorf("step %d failed: %w", i, err)
		}

		totalTokens += stepResult.TokensUsed

		// Parse output for next step
		var outputMap map[string]interface{}
		if err := json.Unmarshal(stepResult.Output, &outputMap); err == nil {
			// Merge output into input for next step
			for k, v := range outputMap {
				currentInput[k] = v
			}
		}
	}

	output, _ := json.Marshal(currentInput)

	return &ExecutionResult{
		Success:    true,
		Output:     output,
		TokensUsed: totalTokens,
	}, nil
}

// buildPrompt builds prompt with input variables
func (e *SkillExecutor) buildPrompt(template string, input map[string]interface{}) string {
	prompt := template
	for key, value := range input {
		placeholder := fmt.Sprintf("{{%s}}", key)
		valueStr := fmt.Sprintf("%v", value)
		prompt = replaceAll(prompt, placeholder, valueStr)
	}
	return prompt
}

// replaceAll replaces all occurrences of old with new in s
func replaceAll(s, old, new string) string {
	result := s
	for {
		i := indexOf(result, old)
		if i == -1 {
			break
		}
		result = result[:i] + new + result[i+len(old):]
	}
	return result
}

// indexOf returns the index of the first occurrence of substr in s
func indexOf(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}

// Handler implementations
func (e *SkillExecutor) handleDataAnalysis(_ context.Context, input map[string]interface{}, _ map[string]interface{}) (interface{}, error) {
	// Placeholder for data analysis logic
	return map[string]interface{}{
		"analysis_result": "Data analysis completed",
		"input_count":     len(input),
	}, nil
}

func (e *SkillExecutor) handleReportGeneration(_ context.Context, _ map[string]interface{}, params map[string]interface{}) (interface{}, error) {
	// Placeholder for report generation logic
	return map[string]interface{}{
		"report": "Generated report content",
		"format": params["format"],
	}, nil
}

func (e *SkillExecutor) handleWebScraping(_ context.Context, input map[string]interface{}, _ map[string]interface{}) (interface{}, error) {
	url, ok := input["url"].(string)
	if !ok {
		return nil, errors.New("url is required for web scraping")
	}

	// Placeholder for web scraping logic
	return map[string]interface{}{
		"url":     url,
		"content": "Scraped content placeholder",
		"status":  "success",
	}, nil
}

func (e *SkillExecutor) handleEmailSend(_ context.Context, input map[string]interface{}, _ map[string]interface{}) (interface{}, error) {
	to, ok := input["to"].(string)
	if !ok {
		return nil, errors.New("to address is required for email")
	}

	subject, _ := input["subject"].(string)
	body, _ := input["body"].(string)

	// Placeholder for email sending logic
	return map[string]interface{}{
		"to":      to,
		"subject": subject,
		"body":    body,
		"sent":    true,
	}, nil
}
