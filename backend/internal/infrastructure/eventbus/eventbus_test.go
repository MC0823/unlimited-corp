package eventbus

import (
	"context"
	"encoding/json"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewEventBus(t *testing.T) {
	eb := NewEventBus()

	require.NotNil(t, eb)
	assert.NotNil(t, eb.subscriptions)
	assert.NotNil(t, eb.eventHistory)
	assert.Equal(t, 1000, eb.maxHistory)
}

func TestEventBus_Subscribe(t *testing.T) {
	eb := NewEventBus()

	handler := func(ctx context.Context, event *Event) error {
		return nil
	}

	sub := eb.Subscribe(EventTaskCreated, handler)

	require.NotNil(t, sub)
	assert.NotEmpty(t, sub.ID)
	assert.Equal(t, EventTaskCreated, sub.EventType)
	assert.Len(t, eb.subscriptions[EventTaskCreated], 1)
}

func TestEventBus_SubscribeAll(t *testing.T) {
	eb := NewEventBus()

	handler := func(ctx context.Context, event *Event) error {
		return nil
	}

	sub := eb.SubscribeAll(handler)

	require.NotNil(t, sub)
	assert.Equal(t, EventType("*"), sub.EventType)
}

func TestEventBus_Unsubscribe(t *testing.T) {
	eb := NewEventBus()

	handler := func(ctx context.Context, event *Event) error {
		return nil
	}

	sub := eb.Subscribe(EventTaskCreated, handler)
	assert.Len(t, eb.subscriptions[EventTaskCreated], 1)

	eb.Unsubscribe(sub)

	assert.Len(t, eb.subscriptions[EventTaskCreated], 0)
}

func TestEventBus_Publish(t *testing.T) {
	eb := NewEventBus()
	ctx := context.Background()

	var received atomic.Bool
	handler := func(ctx context.Context, event *Event) error {
		received.Store(true)
		return nil
	}

	eb.Subscribe(EventTaskCreated, handler)

	event := &Event{
		Type:    EventTaskCreated,
		Source:  "test",
		Payload: json.RawMessage(`{"task_id": "123"}`),
	}

	err := eb.Publish(ctx, event)
	require.NoError(t, err)

	// Wait for async handler
	time.Sleep(50 * time.Millisecond)
	assert.True(t, received.Load())
}

func TestEventBus_Publish_SetsIDAndTimestamp(t *testing.T) {
	eb := NewEventBus()
	ctx := context.Background()

	event := &Event{
		Type:    EventTaskCreated,
		Source:  "test",
		Payload: json.RawMessage(`{}`),
	}

	err := eb.Publish(ctx, event)
	require.NoError(t, err)

	assert.NotEmpty(t, event.ID)
	assert.False(t, event.Timestamp.IsZero())
}

func TestEventBus_PublishSync(t *testing.T) {
	eb := NewEventBus()
	ctx := context.Background()

	var received atomic.Bool
	handler := func(ctx context.Context, event *Event) error {
		received.Store(true)
		return nil
	}

	eb.Subscribe(EventTaskCreated, handler)

	event := &Event{
		Type:    EventTaskCreated,
		Source:  "test",
		Payload: json.RawMessage(`{}`),
	}

	err := eb.PublishSync(ctx, event)
	require.NoError(t, err)

	// Should be received immediately (sync)
	assert.True(t, received.Load())
}

func TestEventBus_MultipleSubscribers(t *testing.T) {
	eb := NewEventBus()
	ctx := context.Background()

	var count atomic.Int32
	handler1 := func(ctx context.Context, event *Event) error {
		count.Add(1)
		return nil
	}
	handler2 := func(ctx context.Context, event *Event) error {
		count.Add(1)
		return nil
	}

	eb.Subscribe(EventTaskCreated, handler1)
	eb.Subscribe(EventTaskCreated, handler2)

	event := &Event{
		Type:    EventTaskCreated,
		Source:  "test",
		Payload: json.RawMessage(`{}`),
	}

	err := eb.PublishSync(ctx, event)
	require.NoError(t, err)

	assert.Equal(t, int32(2), count.Load())
}

func TestEventBus_SubscribeAllReceivesAllEvents(t *testing.T) {
	eb := NewEventBus()
	ctx := context.Background()

	var receivedEvents []EventType
	var mu sync.Mutex
	handler := func(ctx context.Context, event *Event) error {
		mu.Lock()
		receivedEvents = append(receivedEvents, event.Type)
		mu.Unlock()
		return nil
	}

	eb.SubscribeAll(handler)

	events := []EventType{EventTaskCreated, EventEmployeeOnline, EventSkillCardCreated}
	for _, eventType := range events {
		event := &Event{
			Type:    eventType,
			Source:  "test",
			Payload: json.RawMessage(`{}`),
		}
		err := eb.PublishSync(ctx, event)
		require.NoError(t, err)
	}

	assert.Len(t, receivedEvents, 3)
}

func TestEventBus_GetHistory(t *testing.T) {
	eb := NewEventBus()
	ctx := context.Background()

	for i := 0; i < 5; i++ {
		event := &Event{
			Type:    EventTaskCreated,
			Source:  "test",
			Payload: json.RawMessage(`{}`),
		}
		_ = eb.Publish(ctx, event)
	}

	history := eb.GetHistory(3)
	assert.Len(t, history, 3)

	allHistory := eb.GetHistory(0)
	assert.Len(t, allHistory, 5)
}

func TestEventBus_GetHistoryByType(t *testing.T) {
	eb := NewEventBus()
	ctx := context.Background()

	// Publish mixed events
	for i := 0; i < 3; i++ {
		_ = eb.Publish(ctx, &Event{Type: EventTaskCreated, Source: "test", Payload: json.RawMessage(`{}`)})
		_ = eb.Publish(ctx, &Event{Type: EventEmployeeOnline, Source: "test", Payload: json.RawMessage(`{}`)})
	}

	taskHistory := eb.GetHistoryByType(EventTaskCreated, 10)
	assert.Len(t, taskHistory, 3)

	employeeHistory := eb.GetHistoryByType(EventEmployeeOnline, 2)
	assert.Len(t, employeeHistory, 2)
}

func TestEventBus_HistoryLimit(t *testing.T) {
	eb := NewEventBus()
	eb.maxHistory = 5
	ctx := context.Background()

	// Publish more than max
	for i := 0; i < 10; i++ {
		_ = eb.Publish(ctx, &Event{Type: EventTaskCreated, Source: "test", Payload: json.RawMessage(`{}`)})
	}

	history := eb.GetHistory(0)
	assert.Len(t, history, 5)
}

func TestNewEvent(t *testing.T) {
	payload := map[string]interface{}{
		"task_id": "123",
		"title":   "Test Task",
	}
	metadata := Metadata{
		UserID:    "user-1",
		CompanyID: "company-1",
		TraceID:   "trace-1",
		Version:   1,
	}

	event, err := NewEvent(EventTaskCreated, "test-service", payload, metadata)

	require.NoError(t, err)
	require.NotNil(t, event)
	assert.NotEmpty(t, event.ID)
	assert.Equal(t, EventTaskCreated, event.Type)
	assert.Equal(t, "test-service", event.Source)
	assert.Equal(t, metadata, event.Metadata)
	assert.False(t, event.Timestamp.IsZero())

	// Verify payload
	var unmarshaled map[string]interface{}
	err = json.Unmarshal(event.Payload, &unmarshaled)
	require.NoError(t, err)
	assert.Equal(t, "123", unmarshaled["task_id"])
}

func TestEventType_Constants(t *testing.T) {
	// Task events
	assert.Equal(t, EventType("task.created"), EventTaskCreated)
	assert.Equal(t, EventType("task.assigned"), EventTaskAssigned)
	assert.Equal(t, EventType("task.started"), EventTaskStarted)
	assert.Equal(t, EventType("task.completed"), EventTaskCompleted)
	assert.Equal(t, EventType("task.failed"), EventTaskFailed)
	assert.Equal(t, EventType("task.cancelled"), EventTaskCancelled)
	assert.Equal(t, EventType("task.progress"), EventTaskProgress)

	// Employee events
	assert.Equal(t, EventType("employee.created"), EventEmployeeCreated)
	assert.Equal(t, EventType("employee.updated"), EventEmployeeUpdated)
	assert.Equal(t, EventType("employee.online"), EventEmployeeOnline)
	assert.Equal(t, EventType("employee.offline"), EventEmployeeOffline)

	// SkillCard events
	assert.Equal(t, EventType("skillcard.created"), EventSkillCardCreated)
	assert.Equal(t, EventType("skillcard.updated"), EventSkillCardUpdated)
}

func TestGetEventBus_Singleton(t *testing.T) {
	eb1 := GetEventBus()
	eb2 := GetEventBus()

	assert.Same(t, eb1, eb2)
}
