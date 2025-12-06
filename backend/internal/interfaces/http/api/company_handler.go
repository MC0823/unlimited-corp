package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"unlimited-corp/internal/application/company"
	"unlimited-corp/internal/interfaces/http/middleware"
	"unlimited-corp/pkg/errors"
)

type CompanyHandler struct {
	service *company.Service
}

func NewCompanyHandler(service *company.Service) *CompanyHandler {
	return &CompanyHandler{service: service}
}

func (h *CompanyHandler) RegisterRoutes(r *gin.RouterGroup) {
	companies := r.Group("/companies")
	companies.Use(middleware.AuthRequired())
	{
		companies.POST("", h.Create)
		companies.GET("/my", h.GetMy)
		companies.GET("/:id", h.GetByID)
		companies.PUT("/:id", h.Update)
		companies.DELETE("/:id", h.Delete)
	}
}

func (h *CompanyHandler) Create(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	var input company.CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	input.UserID = userID.(uuid.UUID)

	result, err := h.service.Create(c.Request.Context(), &input)
	if err != nil {
		if err.Error() == "user already has a company" {
			c.JSON(http.StatusConflict, gin.H{"code": 409, "message": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to create company"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"code": 201, "data": result})
}

func (h *CompanyHandler) GetMy(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	result, err := h.service.GetByUserID(c.Request.Context(), userID.(uuid.UUID))
	if err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "company not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to get company"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

func (h *CompanyHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid company id"})
		return
	}

	result, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "company not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to get company"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

func (h *CompanyHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid company id"})
		return
	}

	var input company.UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	result, err := h.service.Update(c.Request.Context(), id, &input)
	if err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "company not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to update company"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": result})
}

func (h *CompanyHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid company id"})
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "company not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to delete company"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "company deleted successfully"})
}
