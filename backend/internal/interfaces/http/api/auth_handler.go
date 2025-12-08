package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	userApp "unlimited-corp/internal/application/user"
	"unlimited-corp/internal/interfaces/http/middleware"
	"unlimited-corp/pkg/errors"
)

// AuthHandler 认证处理器
type AuthHandler struct {
	userService *userApp.Service
}

// NewAuthHandler 创建认证处理器
func NewAuthHandler(userService *userApp.Service) *AuthHandler {
	return &AuthHandler{userService: userService}
}

// RegisterRoutes 注册路由
func (h *AuthHandler) RegisterRoutes(r *gin.RouterGroup) {
	auth := r.Group("/auth")
	{
		auth.POST("/register", h.Register)
		auth.POST("/login", h.Login)
		auth.POST("/refresh", h.RefreshToken)
	}

	user := r.Group("/user")
	user.Use(middleware.AuthRequired())
	{
		user.GET("/profile", h.GetProfile)
		user.PUT("/profile", h.UpdateProfile)
	}
}

// Register 用户注册
// @Summary 用户注册
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body userApp.RegisterInput true "注册信息"
// @Success 201 {object} userApp.RegisterOutput
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var input userApp.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	output, err := h.userService.Register(c.Request.Context(), &input)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"code":    0,
		"message": "success",
		"data":    output,
	})
}

// Login 用户登录
// @Summary 用户登录
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body userApp.LoginInput true "登录信息"
// @Success 200 {object} userApp.LoginOutput
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var input userApp.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	output, err := h.userService.Login(c.Request.Context(), &input)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    output,
	})
}

// RefreshToken 刷新Token
// @Summary 刷新Token
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body userApp.RefreshTokenInput true "刷新Token"
// @Success 200 {object} jwt.TokenPair
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var input userApp.RefreshTokenInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	tokenPair, err := h.userService.RefreshToken(c.Request.Context(), &input)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    tokenPair,
	})
}

// GetProfile 获取用户信息
// @Summary 获取用户信息
// @Tags 用户
// @Security Bearer
// @Produce json
// @Success 200 {object} user.User
// @Router /user/profile [get]
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "unauthorized",
		})
		return
	}

	user, err := h.userService.GetProfile(c.Request.Context(), userID.(uuid.UUID))
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    user,
	})
}

// UpdateProfile 更新用户信息
// @Summary 更新用户信息
// @Tags 用户
// @Security Bearer
// @Accept json
// @Produce json
// @Param request body userApp.UpdateProfileInput true "更新信息"
// @Success 200 {object} user.User
// @Router /user/profile [put]
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get(middleware.UserIDKey)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"code":    401,
			"message": "unauthorized",
		})
		return
	}

	var input userApp.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "invalid request: " + err.Error(),
		})
		return
	}

	user, err := h.userService.UpdateProfile(c.Request.Context(), userID.(uuid.UUID), &input)
	if err != nil {
		handleError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "success",
		"data":    user,
	})
}

// handleError 处理错误
func handleError(c *gin.Context, err error) {
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
