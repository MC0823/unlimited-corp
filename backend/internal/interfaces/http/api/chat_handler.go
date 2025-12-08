package api

import (
	"net/http"
	"strconv"

	chatApp "unlimited-corp/internal/application/chat"
	"unlimited-corp/internal/interfaces/http/middleware"
	"unlimited-corp/pkg/errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ChatHandler struct {
	service *chatApp.Service
}

func NewChatHandler(service *chatApp.Service) *ChatHandler {
	return &ChatHandler{service: service}
}

func (h *ChatHandler) RegisterRoutes(r *gin.RouterGroup) {
	chat := r.Group("/chat")
	chat.Use(middleware.AuthRequired())
	{
		chat.POST("/sessions", h.CreateSession)
		chat.GET("/sessions", h.ListSessions)
		chat.GET("/sessions/:id", h.GetSession)
		chat.DELETE("/sessions/:id", h.DeleteSession)

		chat.POST("/messages", h.CreateMessage)
		chat.GET("/sessions/:id/messages", h.ListMessages)
	}
}

func (h *ChatHandler) CreateSession(c *gin.Context) {
	var input chatApp.CreateSessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	result, err := h.service.CreateSession(c.Request.Context(), &input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to create session"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"code": 0, "message": "success", "data": result})
}

func (h *ChatHandler) ListSessions(c *gin.Context) {
	companyID, err := uuid.Parse(c.Query("company_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid company_id"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	result, err := h.service.ListSessionsByCompanyID(c.Request.Context(), companyID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to list sessions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "success", "data": result})
}

func (h *ChatHandler) GetSession(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid session id"})
		return
	}

	result, err := h.service.GetSessionByID(c.Request.Context(), id)
	if err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to get session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "success", "data": result})
}

func (h *ChatHandler) DeleteSession(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid session id"})
		return
	}

	if err := h.service.DeleteSession(c.Request.Context(), id); err != nil {
		if err == errors.ErrNotFound {
			c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "session not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to delete session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "session deleted successfully"})
}

func (h *ChatHandler) CreateMessage(c *gin.Context) {
	var input chatApp.CreateMessageInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	result, err := h.service.CreateMessage(c.Request.Context(), &input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to create message"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"code": 0, "message": "success", "data": result})
}

func (h *ChatHandler) ListMessages(c *gin.Context) {
	sessionID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "invalid session id"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	result, err := h.service.ListMessagesBySessionID(c.Request.Context(), sessionID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "failed to list messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 0, "message": "success", "data": result})
}
