package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	taskApp "unlimited-corp/internal/application/task"
	taskDomain "unlimited-corp/internal/domain/task"
	"unlimited-corp/internal/interfaces/http/middleware"
	"unlimited-corp/pkg/errors"
)

type TaskHandler struct {
	service *taskApp.Service
}

func NewTaskHandler(service *taskApp.Service) *TaskHandler {
	return &TaskHandler{service: service}
}

func (h *TaskHandler) RegisterRoutes(r *gin.RouterGroup) {
	tasks := r.Group("/tasks")
	tasks.Use(middleware.AuthRequired())
	{
		tasks.POST("", h.Create)
		tasks.GET("", h.List)
		tasks.GET("/:id", h.GetByID)
		tasks.PUT("/:id", h.Update)
		tasks.PATCH("/:id/status", h.UpdateStatus)
		tasks.DELETE("/:id", h.Delete)
	}
}

func (h *TaskHandler) Create(c *gin.Context) {
	var input taskApp.CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	result, err := h.service.Create(c.Request.Context(), &input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to create task"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"code": 201, "data": result})
}

func (h *TaskHandler) List(c *gin.Context) {
	companyID, err := uuid.Parse(c.Query("company_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid company_id"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	result, err := h.service.ListByCompanyID(c.Request.Context(), companyID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to list tasks"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

func (h *TaskHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid task id"})
		return
	}

	result, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to get task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

func (h *TaskHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid task id"})
		return
	}

	var input taskApp.UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	result, err := h.service.Update(c.Request.Context(), id, &input)
	if err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to update task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

func (h *TaskHandler) UpdateStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid task id"})
		return
	}

	var input struct {
		Status taskDomain.TaskStatus `json:"status" binding:"required,oneof=pending running paused completed failed cancelled"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	result, err := h.service.UpdateStatus(c.Request.Context(), id, input.Status)
	if err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to update task status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

func (h *TaskHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid task id"})
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "task not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to delete task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "task deleted successfully"})
}
