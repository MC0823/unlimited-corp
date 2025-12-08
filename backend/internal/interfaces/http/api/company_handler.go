package api

import (
	"net/http"

	"unlimited-corp/internal/application/company"
	"unlimited-corp/internal/interfaces/http/helpers"
	"unlimited-corp/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
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
	userID, ok := helpers.MustGetUserID(c)
	if !ok {
		return
	}

	var input company.CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.RespondError(c, http.StatusBadRequest, err.Error())
		return
	}

	input.UserID = userID

	result, err := h.service.Create(c.Request.Context(), &input)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{"code": 0, "message": "success", "data": result})
}

func (h *CompanyHandler) GetMy(c *gin.Context) {
	userID, ok := helpers.MustGetUserID(c)
	if !ok {
		return
	}

	result, err := h.service.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	helpers.RespondSuccess(c, result)
}

func (h *CompanyHandler) GetByID(c *gin.Context) {
	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	result, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	helpers.RespondSuccess(c, result)
}

func (h *CompanyHandler) Update(c *gin.Context) {
	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	var input company.UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.RespondError(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.service.Update(c.Request.Context(), id, &input)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	helpers.RespondSuccess(c, result)
}

func (h *CompanyHandler) Delete(c *gin.Context) {
	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "company deleted successfully"})
}
