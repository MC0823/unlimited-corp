package api

import (
	"testing"

	"unlimited-corp/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func init() {
	gin.SetMode(gin.TestMode)
}

// Helper middleware for tests
func mockCompanyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set(middleware.CompanyIDKey, uuid.New())
		c.Next()
	}
}

func TestNewEmployeeHandler(t *testing.T) {
	handler := NewEmployeeHandler(nil)
	assert.NotNil(t, handler)
}

func TestEmployeeHandler_RegisterRoutes(t *testing.T) {
	router := gin.New()
	handler := &EmployeeHandler{employeeService: nil}
	api := router.Group("/api/v1")
	handler.RegisterRoutes(api, mockCompanyMiddleware())

	routes := router.Routes()

	// Verify routes are registered
	assert.NotEmpty(t, routes, "Routes should be registered")

	// Count employee routes
	employeeRouteCount := 0
	for _, r := range routes {
		if len(r.Path) >= 17 && r.Path[:17] == "/api/v1/employees" {
			employeeRouteCount++
		}
	}

	// Should have at least CRUD routes
	assert.GreaterOrEqual(t, employeeRouteCount, 5, "Should have at least 5 employee routes")
}
