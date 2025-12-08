package temporal

import (
	"context"
	"fmt"
	"time"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
)

// TemporalClient wraps the Temporal SDK client
type TemporalClient struct {
	client    client.Client
	taskQueue string
}

// Config holds Temporal client configuration
type Config struct {
	HostPort  string
	Namespace string
	TaskQueue string
}

// DefaultConfig returns default Temporal configuration
func DefaultConfig() *Config {
	return &Config{
		HostPort:  "localhost:7233",
		Namespace: "default",
		TaskQueue: "unlimited-corp-tasks",
	}
}

// NewTemporalClient creates a new Temporal client
func NewTemporalClient(ctx context.Context, cfg *Config) (*TemporalClient, error) {
	if cfg == nil {
		cfg = DefaultConfig()
	}

	c, err := client.Dial(client.Options{
		HostPort:  cfg.HostPort,
		Namespace: cfg.Namespace,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create temporal client: %w", err)
	}

	return &TemporalClient{
		client:    c,
		taskQueue: cfg.TaskQueue,
	}, nil
}

// Close closes the Temporal client connection
func (tc *TemporalClient) Close() {
	if tc.client != nil {
		tc.client.Close()
	}
}

// GetClient returns the underlying Temporal client
func (tc *TemporalClient) GetClient() client.Client {
	return tc.client
}

// GetTaskQueue returns the task queue name
func (tc *TemporalClient) GetTaskQueue() string {
	return tc.taskQueue
}

// StartWorkflow starts a new workflow execution
func (tc *TemporalClient) StartWorkflow(ctx context.Context, workflowID string, workflowType interface{}, input interface{}) (client.WorkflowRun, error) {
	options := client.StartWorkflowOptions{
		ID:        workflowID,
		TaskQueue: tc.taskQueue,
	}

	return tc.client.ExecuteWorkflow(ctx, options, workflowType, input)
}

// GetWorkflowResult waits for workflow completion and returns the result
func (tc *TemporalClient) GetWorkflowResult(ctx context.Context, workflowID, runID string, result interface{}) error {
	run := tc.client.GetWorkflow(ctx, workflowID, runID)
	return run.Get(ctx, result)
}

// SignalWorkflow sends a signal to a running workflow
func (tc *TemporalClient) SignalWorkflow(ctx context.Context, workflowID, runID, signalName string, arg interface{}) error {
	return tc.client.SignalWorkflow(ctx, workflowID, runID, signalName, arg)
}

// CancelWorkflow cancels a running workflow
func (tc *TemporalClient) CancelWorkflow(ctx context.Context, workflowID, runID string) error {
	return tc.client.CancelWorkflow(ctx, workflowID, runID)
}

// TerminateWorkflow terminates a running workflow
func (tc *TemporalClient) TerminateWorkflow(ctx context.Context, workflowID, runID, reason string) error {
	return tc.client.TerminateWorkflow(ctx, workflowID, runID, reason)
}

// QueryWorkflow queries a workflow for its current state
func (tc *TemporalClient) QueryWorkflow(ctx context.Context, workflowID, runID, queryType string, args ...interface{}) (interface{}, error) {
	response, err := tc.client.QueryWorkflow(ctx, workflowID, runID, queryType, args...)
	if err != nil {
		return nil, err
	}

	var result interface{}
	if err := response.Get(&result); err != nil {
		return nil, err
	}

	return result, nil
}

// CreateWorker creates a new Temporal worker
func (tc *TemporalClient) CreateWorker(options worker.Options) worker.Worker {
	if options.MaxConcurrentActivityExecutionSize == 0 {
		options.MaxConcurrentActivityExecutionSize = 10
	}
	if options.MaxConcurrentWorkflowTaskExecutionSize == 0 {
		options.MaxConcurrentWorkflowTaskExecutionSize = 10
	}

	return worker.New(tc.client, tc.taskQueue, options)
}

// HealthCheck checks if Temporal server is reachable
func (tc *TemporalClient) HealthCheck(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Try to describe the namespace to verify connection
	_, err := tc.client.WorkflowService().DescribeNamespace(ctx, nil)
	if err != nil {
		return fmt.Errorf("temporal health check failed: %w", err)
	}

	return nil
}
