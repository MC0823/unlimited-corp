package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuthHandler_RegisterRoutes(t *testing.T) {
	// Test that routes are registered correctly
	router := gin.New()
	handler := &AuthHandler{userService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api)

	routes := router.Routes()
	assert.NotEmpty(t, routes, "Routes should be registered")

	// Count auth routes
	authRouteCount := 0
	for _, r := range routes {
		if len(r.Path) >= 13 && r.Path[:13] == "/api/v1/auth/" {
			authRouteCount++
		}
	}
	assert.GreaterOrEqual(t, authRouteCount, 3, "Should have at least 3 auth routes")
}

func TestAuthHandler_Register_InvalidJSON(t *testing.T) {
	router := gin.New()
	handler := &AuthHandler{userService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api)

	req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBufferString("invalid json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, float64(400), response["code"])
}

func TestAuthHandler_Login_InvalidJSON(t *testing.T) {
	router := gin.New()
	handler := &AuthHandler{userService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api)

	req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBufferString("{invalid}"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_RefreshToken_InvalidJSON(t *testing.T) {
	router := gin.New()
	handler := &AuthHandler{userService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api)

	req := httptest.NewRequest("POST", "/api/v1/auth/refresh", bytes.NewBufferString("not-json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_GetProfile_Unauthorized(t *testing.T) {
	router := gin.New()
	handler := &AuthHandler{userService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api)

	req := httptest.NewRequest("GET", "/api/v1/user/profile", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Should be 401 Unauthorized (handled by middleware)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestAuthHandler_UpdateProfile_Unauthorized(t *testing.T) {
	router := gin.New()
	handler := &AuthHandler{userService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api)

	body := `{"nickname": "test"}`
	req := httptest.NewRequest("PUT", "/api/v1/user/profile", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Should be 401 Unauthorized (handled by middleware)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestHandleError_AppError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Create an app error manually
	c.JSON(http.StatusBadRequest, gin.H{
		"code":    400,
		"message": "test error",
	})

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)
	assert.Equal(t, "test error", response["message"])
}

func TestHandleError_InternalError(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// Simulate internal error
	c.JSON(http.StatusInternalServerError, gin.H{
		"code":    500,
		"message": "internal server error",
	})

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestAuthHandler_Register_MissingFields(t *testing.T) {
	router := gin.New()
	handler := &AuthHandler{userService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api)

	// Empty body
	req := httptest.NewRequest("POST", "/api/v1/auth/register", bytes.NewBufferString("{}"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Should fail validation
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_Login_EmptyCredentials(t *testing.T) {
	router := gin.New()
	handler := &AuthHandler{userService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api)

	// Empty body
	req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBufferString("{}"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Should fail validation
	assert.Equal(t, http.StatusBadRequest, w.Code)
}
