package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	employeeApp "unlimited-corp/internal/application/employee"
	"unlimited-corp/internal/interfaces/http/middleware"
	"unlimited-corp/pkg/errors"
)

// EmployeeHandler handles employee related HTTP requests
type EmployeeHandler struct {
	employeeService *employeeApp.Service
}

// NewEmployeeHandler creates a new employee handler
func NewEmployeeHandler(employeeService *employeeApp.Service) *EmployeeHandler {
	return &EmployeeHandler{employeeService: employeeService}
}

// RegisterRoutes registers employee routes
func (h *EmployeeHandler) RegisterRoutes(r *gin.RouterGroup) {
	employees := r.Group("/employees")
	employees.Use(middleware.AuthRequired())
	{
		employees.POST("", h.Create)
		employees.GET("", h.List)
		employees.GET("/available", h.ListAvailable)
		employees.GET("/:id", h.GetByID)
		employees.PUT("/:id", h.Update)
		employees.DELETE("/:id", h.Delete)
		employees.POST("/:id/skills", h.AssignSkill)
		employees.DELETE("/:id/skills/:skillId", h.RemoveSkill)
		employees.GET("/:id/skills", h.GetSkills)
		employees.PUT("/:id/status", h.SetStatus)
	}
}

// Create creates a new employee
func (h *EmployeeHandler) Create(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	var input employeeApp.CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	input.CompanyID = companyID.(uuid.UUID)

	emp, err := h.employeeService.Create(c.Request.Context(), &input)
	if err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":    0,
		"message": "success",
		"data":    emp,
	})
}

// List retrieves all employees for the current company
func (h *EmployeeHandler) List(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	employees, err := h.employeeService.List(c.Request.Context(), companyID.(uuid.UUID))
	if err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    employees,
	})
}

// ListAvailable retrieves all available employees
func (h *EmployeeHandler) ListAvailable(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	employees, err := h.employeeService.ListAvailable(c.Request.Context(), companyID.(uuid.UUID))
	if err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    employees,
	})
}

// GetByID retrieves an employee by ID
func (h *EmployeeHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid employee id",
		})
		return
	}

	emp, err := h.employeeService.GetByID(c.Request.Context(), id)
	if err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    emp,
	})
}

// Update updates an employee
func (h *EmployeeHandler) Update(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid employee id",
		})
		return
	}

	var input employeeApp.UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	input.ID = id
	input.CompanyID = companyID.(uuid.UUID)

	emp, err := h.employeeService.Update(c.Request.Context(), &input)
	if err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    emp,
	})
}

// Delete deletes an employee
func (h *EmployeeHandler) Delete(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid employee id",
		})
		return
	}

	if err := h.employeeService.Delete(c.Request.Context(), id, companyID.(uuid.UUID)); err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}

// AssignSkill assigns a skill to an employee
func (h *EmployeeHandler) AssignSkill(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	idStr := c.Param("id")
	employeeID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid employee id",
		})
		return
	}

	var input employeeApp.AssignSkillInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	input.EmployeeID = employeeID
	input.CompanyID = companyID.(uuid.UUID)

	if err := h.employeeService.AssignSkill(c.Request.Context(), &input); err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}

// RemoveSkill removes a skill from an employee
func (h *EmployeeHandler) RemoveSkill(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	idStr := c.Param("id")
	employeeID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid employee id",
		})
		return
	}

	skillIdStr := c.Param("skillId")
	skillCardID, err := uuid.Parse(skillIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid skill card id",
		})
		return
	}

	if err := h.employeeService.RemoveSkill(c.Request.Context(), employeeID, skillCardID, companyID.(uuid.UUID)); err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}

// GetSkills retrieves all skills for an employee
func (h *EmployeeHandler) GetSkills(c *gin.Context) {
	idStr := c.Param("id")
	employeeID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid employee id",
		})
		return
	}

	skills, err := h.employeeService.GetSkills(c.Request.Context(), employeeID)
	if err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    skills,
	})
}

// SetStatusInput represents the input for setting employee status
type SetStatusInput struct {
	Status string `json:"status" binding:"required"`
}

// SetStatus sets the status of an employee
func (h *EmployeeHandler) SetStatus(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid employee id",
		})
		return
	}

	var input SetStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	emp, err := h.employeeService.SetStatus(c.Request.Context(), id, companyID.(uuid.UUID), input.Status)
	if err != nil {
		handleEmployeeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    emp,
	})
}

// handleEmployeeError handles employee errors
func handleEmployeeError(c *gin.Context, err error) {
	if appErr, ok := err.(*errors.AppError); ok {
		c.JSON(appErr.Code, gin.H{
			"code":    appErr.Code,
			"message": appErr.Message,
		})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{
		"code":    500,
		"message": "internal server error",
	})
}
