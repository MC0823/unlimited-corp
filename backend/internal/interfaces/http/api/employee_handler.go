package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	employeeApp "unlimited-corp/internal/application/employee"
	"unlimited-corp/internal/interfaces/http/helpers"
	"unlimited-corp/internal/interfaces/http/middleware"
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
func (h *EmployeeHandler) RegisterRoutes(r *gin.RouterGroup, companyMiddleware gin.HandlerFunc) {
	employees := r.Group("/employees")
	employees.Use(middleware.AuthRequired())
	employees.Use(companyMiddleware)
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
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	var input employeeApp.CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.RespondError(c, http.StatusBadRequest, "invalid request: "+err.Error())
		return
	}

	input.CompanyID = companyID

	emp, err := h.employeeService.Create(c.Request.Context(), &input)
	if err != nil {
		helpers.HandleError(c, err)
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
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	employees, err := h.employeeService.List(c.Request.Context(), companyID)
	if err != nil {
		helpers.HandleError(c, err)
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
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	employees, err := h.employeeService.ListAvailable(c.Request.Context(), companyID)
	if err != nil {
		helpers.HandleError(c, err)
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
	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	emp, err := h.employeeService.GetByID(c.Request.Context(), id)
	if err != nil {
		helpers.HandleError(c, err)
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
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	var input employeeApp.UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.RespondError(c, http.StatusBadRequest, "invalid request: "+err.Error())
		return
	}

	input.ID = id
	input.CompanyID = companyID

	emp, err := h.employeeService.Update(c.Request.Context(), &input)
	if err != nil {
		helpers.HandleError(c, err)
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
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	if err := h.employeeService.Delete(c.Request.Context(), id, companyID); err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}

// AssignSkill assigns a skill to an employee
func (h *EmployeeHandler) AssignSkill(c *gin.Context) {
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	employeeID, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	var input employeeApp.AssignSkillInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.RespondError(c, http.StatusBadRequest, "invalid request: "+err.Error())
		return
	}

	input.EmployeeID = employeeID
	input.CompanyID = companyID

	if err := h.employeeService.AssignSkill(c.Request.Context(), &input); err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}

// RemoveSkill removes a skill from an employee
func (h *EmployeeHandler) RemoveSkill(c *gin.Context) {
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	employeeID, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	skillCardID, ok := helpers.ParseUUID(c, "skillId")
	if !ok {
		return
	}

	if err := h.employeeService.RemoveSkill(c.Request.Context(), employeeID, skillCardID, companyID); err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}

// GetSkills retrieves all skills for an employee
func (h *EmployeeHandler) GetSkills(c *gin.Context) {
	employeeID, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	skills, err := h.employeeService.GetSkills(c.Request.Context(), employeeID)
	if err != nil {
		helpers.HandleError(c, err)
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
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	var input SetStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.RespondError(c, http.StatusBadRequest, "invalid request: "+err.Error())
		return
	}

	emp, err := h.employeeService.SetStatus(c.Request.Context(), id, companyID, input.Status)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    emp,
	})
}
