package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func setupHealthRouter() *gin.Engine {
	router := gin.New()
	handler := NewHealthHandler()
	api := router.Group("/api")
	handler.RegisterRoutes(api)
	return router
}

func TestHealthHandler_Health(t *testing.T) {
	router := setupHealthRouter()

	req, _ := http.NewRequest("GET", "/api/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, "healthy", response["status"])
}

func TestHealthHandler_Ready(t *testing.T) {
	router := setupHealthRouter()

	req, _ := http.NewRequest("GET", "/api/health/ready", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, "ready", response["status"])
}

func TestHealthHandler_Live(t *testing.T) {
	router := setupHealthRouter()

	req, _ := http.NewRequest("GET", "/api/health/live", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, "alive", response["status"])
}

func TestNewHealthHandler(t *testing.T) {
	handler := NewHealthHandler()
	assert.NotNil(t, handler)
}

func TestHealthHandler_RegisterRoutes(t *testing.T) {
	router := gin.New()
	handler := NewHealthHandler()
	api := router.Group("/api")
	handler.RegisterRoutes(api)

	routes := router.Routes()

	// Check that all health routes are registered
	expectedPaths := map[string]string{
		"/api/health":       "GET",
		"/api/health/ready": "GET",
		"/api/health/live":  "GET",
	}

	for _, route := range routes {
		if method, exists := expectedPaths[route.Path]; exists {
			assert.Equal(t, method, route.Method)
			delete(expectedPaths, route.Path)
		}
	}

	// All expected routes should be found
	assert.Empty(t, expectedPaths, "Some routes were not registered")
}

func TestHealthHandler_ContentType(t *testing.T) {
	router := setupHealthRouter()

	req, _ := http.NewRequest("GET", "/api/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	contentType := w.Header().Get("Content-Type")
	assert.Contains(t, contentType, "application/json")
}

func TestHealthHandler_NotFound(t *testing.T) {
	router := setupHealthRouter()

	req, _ := http.NewRequest("GET", "/api/health/invalid", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestHealthHandler_WrongMethod(t *testing.T) {
	router := setupHealthRouter()

	req, _ := http.NewRequest("POST", "/api/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}
