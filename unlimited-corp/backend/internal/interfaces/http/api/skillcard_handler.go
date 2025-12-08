package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	skillcardApp "unlimited-corp/internal/application/skillcard"
	"unlimited-corp/internal/interfaces/http/helpers"
	"unlimited-corp/internal/interfaces/http/middleware"
)

// SkillCardHandler handles skill card related HTTP requests
type SkillCardHandler struct {
	skillCardService *skillcardApp.Service
}

// NewSkillCardHandler creates a new skill card handler
func NewSkillCardHandler(skillCardService *skillcardApp.Service) *SkillCardHandler {
	return &SkillCardHandler{skillCardService: skillCardService}
}

// RegisterRoutes registers skill card routes
func (h *SkillCardHandler) RegisterRoutes(r *gin.RouterGroup, companyMiddleware gin.HandlerFunc) {
	skillCards := r.Group("/skill-cards")
	skillCards.Use(middleware.AuthRequired())
	{
		skillCards.GET("/system", h.ListSystem)
	}

	skillCards.Use(companyMiddleware)
	{
		skillCards.POST("", h.Create)
		skillCards.GET("", h.List)
		skillCards.GET("/:id", h.GetByID)
		skillCards.PUT("/:id", h.Update)
		skillCards.DELETE("/:id", h.Delete)
	}
}

// Create creates a new skill card
func (h *SkillCardHandler) Create(c *gin.Context) {
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	var input skillcardApp.CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.RespondError(c, http.StatusBadRequest, "invalid request: "+err.Error())
		return
	}

	input.CompanyID = companyID

	card, err := h.skillCardService.Create(c.Request.Context(), &input)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":    0,
		"message": "success",
		"data":    card,
	})
}

// List retrieves skill cards for the current company
func (h *SkillCardHandler) List(c *gin.Context) {
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	input := skillcardApp.ListInput{
		CompanyID: companyID,
		Category:  c.Query("category"),
		Query:     c.Query("q"),
	}

	cards, err := h.skillCardService.List(c.Request.Context(), &input)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    cards,
	})
}

// ListSystem retrieves all system skill cards
func (h *SkillCardHandler) ListSystem(c *gin.Context) {
	cards, err := h.skillCardService.ListSystemCards(c.Request.Context())
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    cards,
	})
}

// GetByID retrieves a skill card by ID
func (h *SkillCardHandler) GetByID(c *gin.Context) {
	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	card, err := h.skillCardService.GetByID(c.Request.Context(), id)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    card,
	})
}

// Update updates a skill card
func (h *SkillCardHandler) Update(c *gin.Context) {
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	var input skillcardApp.UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		helpers.RespondError(c, http.StatusBadRequest, "invalid request: "+err.Error())
		return
	}

	input.ID = id
	input.CompanyID = companyID

	card, err := h.skillCardService.Update(c.Request.Context(), &input)
	if err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    card,
	})
}

// Delete deletes a skill card
func (h *SkillCardHandler) Delete(c *gin.Context) {
	companyID, ok := helpers.MustGetCompanyID(c)
	if !ok {
		return
	}

	id, ok := helpers.ParseUUID(c, "id")
	if !ok {
		return
	}

	if err := h.skillCardService.Delete(c.Request.Context(), id, companyID); err != nil {
		helpers.HandleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}
