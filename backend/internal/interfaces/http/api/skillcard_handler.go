package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	skillcardApp "unlimited-corp/internal/application/skillcard"
	"unlimited-corp/internal/interfaces/http/middleware"
	"unlimited-corp/pkg/errors"
	"unlimited-corp/pkg/logger"
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
func (h *SkillCardHandler) RegisterRoutes(r *gin.RouterGroup) {
	skillCards := r.Group("/skill-cards")
	skillCards.Use(middleware.AuthRequired())
	{
		skillCards.POST("", h.Create)
		skillCards.GET("", h.List)
		skillCards.GET("/system", h.ListSystem)
		skillCards.GET("/:id", h.GetByID)
		skillCards.PUT("/:id", h.Update)
		skillCards.DELETE("/:id", h.Delete)
	}
}

// Create creates a new skill card
// @Summary Create a skill card
// @Tags SkillCards
// @Security Bearer
// @Accept json
// @Produce json
// @Param request body skillcardApp.CreateInput true "Skill card info"
// @Success 201 {object} skillcard.SkillCard
// @Router /skill-cards [post]
func (h *SkillCardHandler) Create(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	var input skillcardApp.CreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	input.CompanyID = companyID.(uuid.UUID)

	card, err := h.skillCardService.Create(c.Request.Context(), &input)
	if err != nil {
		handleSkillCardError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":    0,
		"message": "success",
		"data":    card,
	})
}

// List retrieves skill cards for the current company
// @Summary List skill cards
// @Tags SkillCards
// @Security Bearer
// @Produce json
// @Param category query string false "Filter by category"
// @Param q query string false "Search query"
// @Success 200 {array} skillcard.SkillCard
// @Router /skill-cards [get]
func (h *SkillCardHandler) List(c *gin.Context) {
	companyID, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "company_id is required",
		})
		return
	}

	input := skillcardApp.ListInput{
		CompanyID: companyID.(uuid.UUID),
		Category:  c.Query("category"),
		Query:     c.Query("q"),
	}

	cards, err := h.skillCardService.List(c.Request.Context(), &input)
	if err != nil {
		handleSkillCardError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    cards,
	})
}

// ListSystem retrieves all system skill cards
// @Summary List system skill cards
// @Tags SkillCards
// @Security Bearer
// @Produce json
// @Success 200 {array} skillcard.SkillCard
// @Router /skill-cards/system [get]
func (h *SkillCardHandler) ListSystem(c *gin.Context) {
	cards, err := h.skillCardService.ListSystemCards(c.Request.Context())
	if err != nil {
		handleSkillCardError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    cards,
	})
}

// GetByID retrieves a skill card by ID
// @Summary Get skill card by ID
// @Tags SkillCards
// @Security Bearer
// @Produce json
// @Param id path string true "Skill card ID"
// @Success 200 {object} skillcard.SkillCard
// @Router /skill-cards/{id} [get]
func (h *SkillCardHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid skill card id",
		})
		return
	}

	card, err := h.skillCardService.GetByID(c.Request.Context(), id)
	if err != nil {
		handleSkillCardError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    card,
	})
}

// Update updates a skill card
// @Summary Update skill card
// @Tags SkillCards
// @Security Bearer
// @Accept json
// @Produce json
// @Param id path string true "Skill card ID"
// @Param request body skillcardApp.UpdateInput true "Update info"
// @Success 200 {object} skillcard.SkillCard
// @Router /skill-cards/{id} [put]
func (h *SkillCardHandler) Update(c *gin.Context) {
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
			"message": "invalid skill card id",
		})
		return
	}

	var input skillcardApp.UpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	input.ID = id
	input.CompanyID = companyID.(uuid.UUID)

	card, err := h.skillCardService.Update(c.Request.Context(), &input)
	if err != nil {
		handleSkillCardError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    card,
	})
}

// Delete deletes a skill card
// @Summary Delete skill card
// @Tags SkillCards
// @Security Bearer
// @Param id path string true "Skill card ID"
// @Success 200 {object} map[string]interface{}
// @Router /skill-cards/{id} [delete]
func (h *SkillCardHandler) Delete(c *gin.Context) {
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
			"message": "invalid skill card id",
		})
		return
	}

	if err := h.skillCardService.Delete(c.Request.Context(), id, companyID.(uuid.UUID)); err != nil {
		handleSkillCardError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
	})
}

// handleSkillCardError handles skill card errors
func handleSkillCardError(c *gin.Context, err error) {
	if appErr, ok := err.(*errors.AppError); ok {
		c.JSON(appErr.Code, gin.H{
			"code":    appErr.Code,
			"message": appErr.Message,
		})
		return
	}

	// Log detailed error for debugging
	logger.Error("SkillCard operation failed", zap.String("error", err.Error()))

	c.JSON(http.StatusInternalServerError, gin.H{
		"code":    500,
		"message": err.Error(),
	})
}
