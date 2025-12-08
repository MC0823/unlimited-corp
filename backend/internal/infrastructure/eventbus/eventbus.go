package eventbus

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/google/uuid"
)

// EventType represents the type of event
type EventType string

const (
	// Task events
	EventTaskCreated   EventType = "task.created"
	EventTaskAssigned  EventType = "task.assigned"
	EventTaskStarted   EventType = "task.started"
	EventTaskCompleted EventType = "task.completed"
	EventTaskFailed    EventType = "task.failed"
	EventTaskCancelled EventType = "task.cancelled"
	EventTaskProgress  EventType = "task.progress"

	// Employee events
	EventEmployeeCreated EventType = "employee.created"
	EventEmployeeUpdated EventType = "employee.updated"
	EventEmployeeDeleted EventType = "employee.deleted"
	EventEmployeeOnline  EventType = "employee.online"
	EventEmployeeOffline EventType = "employee.offline"
	EventEmployeeBusy    EventType = "employee.busy"
	EventEmployeeIdle    EventType = "employee.idle"

	// SkillCard events
	EventSkillCardCreated  EventType = "skillcard.created"
	EventSkillCardUpdated  EventType = "skillcard.updated"
	EventSkillCardDeleted  EventType = "skillcard.deleted"
	EventSkillCardAssigned EventType = "skillcard.assigned"

	// Workflow events
	EventWorkflowStarted   EventType = "workflow.started"
	EventWorkflowCompleted EventType = "workflow.completed"
	EventWorkflowFailed    EventType = "workflow.failed"

	// Chat events
	EventChatMessage  EventType = "chat.message"
	EventChatResponse EventType = "chat.response"

	// System events
	EventSystemNotification EventType = "system.notification"
	EventSystemError        EventType = "system.error"
)

// Event represents a domain event
type Event struct {
	ID        string          `json:"id"`
	Type      EventType       `json:"type"`
	Source    string          `json:"source"`
	Payload   json.RawMessage `json:"payload"`
	Metadata  Metadata        `json:"metadata"`
	Timestamp time.Time       `json:"timestamp"`
}

// Metadata holds event metadata
type Metadata struct {
	UserID    string `json:"user_id,omitempty"`
	CompanyID string `json:"company_id,omitempty"`
	TraceID   string `json:"trace_id,omitempty"`
	Version   int    `json:"version"`
}

// Handler is a function that handles events
type Handler func(ctx context.Context, event *Event) error

// Subscription represents an event subscription
type Subscription struct {
	ID        string
	EventType EventType
	Handler   Handler
}

// EventBus is an in-memory event bus implementation
type EventBus struct {
	mu            sync.RWMutex
	subscriptions map[EventType][]*Subscription
	eventHistory  []*Event
	maxHistory    int
}

// NewEventBus creates a new event bus
func NewEventBus() *EventBus {
	return &EventBus{
		subscriptions: make(map[EventType][]*Subscription),
		eventHistory:  make([]*Event, 0),
		maxHistory:    1000,
	}
}

// Subscribe subscribes to events of a specific type
func (eb *EventBus) Subscribe(eventType EventType, handler Handler) *Subscription {
	eb.mu.Lock()
	defer eb.mu.Unlock()

	sub := &Subscription{
		ID:        uuid.New().String(),
		EventType: eventType,
		Handler:   handler,
	}

	eb.subscriptions[eventType] = append(eb.subscriptions[eventType], sub)
	return sub
}

// SubscribeAll subscribes to all events
func (eb *EventBus) SubscribeAll(handler Handler) *Subscription {
	return eb.Subscribe("*", handler)
}

// Unsubscribe removes a subscription
func (eb *EventBus) Unsubscribe(sub *Subscription) {
	eb.mu.Lock()
	defer eb.mu.Unlock()

	subs := eb.subscriptions[sub.EventType]
	for i, s := range subs {
		if s.ID == sub.ID {
			eb.subscriptions[sub.EventType] = append(subs[:i], subs[i+1:]...)
			break
		}
	}
}

// Publish publishes an event to all subscribers
func (eb *EventBus) Publish(ctx context.Context, event *Event) error {
	eb.mu.RLock()
	defer eb.mu.RUnlock()

	// Add event ID and timestamp if not set
	if event.ID == "" {
		event.ID = uuid.New().String()
	}
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Store in history
	eb.storeEvent(event)

	// Get handlers for this event type
	handlers := eb.subscriptions[event.Type]

	// Also get handlers subscribed to all events
	allHandlers := eb.subscriptions["*"]
	handlers = append(handlers, allHandlers...)

	// Execute handlers asynchronously
	for _, sub := range handlers {
		go func(h Handler) {
			if err := h(ctx, event); err != nil {
				// Log error but don't fail
				// In production, you'd use a proper logger
				_ = err
			}
		}(sub.Handler)
	}

	return nil
}

// PublishSync publishes an event and waits for all handlers to complete
func (eb *EventBus) PublishSync(ctx context.Context, event *Event) error {
	eb.mu.RLock()
	defer eb.mu.RUnlock()

	// Add event ID and timestamp if not set
	if event.ID == "" {
		event.ID = uuid.New().String()
	}
	if event.Timestamp.IsZero() {
		event.Timestamp = time.Now()
	}

	// Store in history
	eb.storeEvent(event)

	// Get handlers
	handlers := eb.subscriptions[event.Type]
	allHandlers := eb.subscriptions["*"]
	handlers = append(handlers, allHandlers...)

	// Execute handlers synchronously
	var wg sync.WaitGroup
	errors := make(chan error, len(handlers))

	for _, sub := range handlers {
		wg.Add(1)
		go func(h Handler) {
			defer wg.Done()
			if err := h(ctx, event); err != nil {
				errors <- err
			}
		}(sub.Handler)
	}

	wg.Wait()
	close(errors)

	// Collect errors
	for err := range errors {
		if err != nil {
			return err
		}
	}

	return nil
}

// storeEvent stores an event in history
func (eb *EventBus) storeEvent(event *Event) {
	eb.eventHistory = append(eb.eventHistory, event)

	// Trim history if needed
	if len(eb.eventHistory) > eb.maxHistory {
		eb.eventHistory = eb.eventHistory[len(eb.eventHistory)-eb.maxHistory:]
	}
}

// GetHistory returns recent events
func (eb *EventBus) GetHistory(limit int) []*Event {
	eb.mu.RLock()
	defer eb.mu.RUnlock()

	if limit <= 0 || limit > len(eb.eventHistory) {
		limit = len(eb.eventHistory)
	}

	result := make([]*Event, limit)
	start := len(eb.eventHistory) - limit
	copy(result, eb.eventHistory[start:])
	return result
}

// GetHistoryByType returns recent events of a specific type
func (eb *EventBus) GetHistoryByType(eventType EventType, limit int) []*Event {
	eb.mu.RLock()
	defer eb.mu.RUnlock()

	var result []*Event
	for i := len(eb.eventHistory) - 1; i >= 0 && len(result) < limit; i-- {
		if eb.eventHistory[i].Type == eventType {
			result = append(result, eb.eventHistory[i])
		}
	}
	return result
}

// NewEvent is a helper to create a new event
func NewEvent(eventType EventType, source string, payload interface{}, metadata Metadata) (*Event, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return &Event{
		ID:        uuid.New().String(),
		Type:      eventType,
		Source:    source,
		Payload:   payloadBytes,
		Metadata:  metadata,
		Timestamp: time.Now(),
	}, nil
}

// Global event bus instance
var globalEventBus *EventBus
var once sync.Once

// GetEventBus returns the global event bus instance
func GetEventBus() *EventBus {
	once.Do(func() {
		globalEventBus = NewEventBus()
	})
	return globalEventBus
}
