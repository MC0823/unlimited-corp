package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestRequestTracing_GeneratesIDs(t *testing.T) {
	router := gin.New()
	router.Use(RequestTracing())

	var capturedRequestID, capturedTraceID string

	router.GET("/test", func(c *gin.Context) {
		capturedRequestID = GetRequestID(c)
		capturedTraceID = GetTraceID(c)
		c.String(http.StatusOK, "ok")
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// 验证生成了ID
	assert.NotEmpty(t, capturedRequestID, "RequestID should be generated")
	assert.NotEmpty(t, capturedTraceID, "TraceID should be generated")

	// 验证响应头包含ID
	assert.Equal(t, capturedRequestID, w.Header().Get(RequestIDHeader))
	assert.Equal(t, capturedTraceID, w.Header().Get(TraceIDHeader))
}

func TestRequestTracing_UsesProvidedIDs(t *testing.T) {
	router := gin.New()
	router.Use(RequestTracing())

	providedRequestID := "my-request-id-123"
	providedTraceID := "my-trace-id-456"
	var capturedRequestID, capturedTraceID string

	router.GET("/test", func(c *gin.Context) {
		capturedRequestID = GetRequestID(c)
		capturedTraceID = GetTraceID(c)
		c.String(http.StatusOK, "ok")
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set(RequestIDHeader, providedRequestID)
	req.Header.Set(TraceIDHeader, providedTraceID)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// 验证使用了提供的ID
	assert.Equal(t, providedRequestID, capturedRequestID)
	assert.Equal(t, providedTraceID, capturedTraceID)

	// 验证响应头返回相同的ID
	assert.Equal(t, providedRequestID, w.Header().Get(RequestIDHeader))
	assert.Equal(t, providedTraceID, w.Header().Get(TraceIDHeader))
}

func TestGetRequestID_NotExists(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())

	requestID := GetRequestID(c)
	assert.Empty(t, requestID, "Should return empty string when RequestID not set")
}

func TestGetTraceID_NotExists(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())

	traceID := GetTraceID(c)
	assert.Empty(t, traceID, "Should return empty string when TraceID not set")
}

func TestGenerateID_Uniqueness(t *testing.T) {
	ids := make(map[string]bool)
	for i := 0; i < 1000; i++ {
		id := generateID()
		assert.NotEmpty(t, id)
		assert.False(t, ids[id], "ID should be unique")
		ids[id] = true
	}
}
