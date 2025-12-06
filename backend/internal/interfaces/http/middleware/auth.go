package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"unlimited-corp/pkg/jwt"
)

const (
	// AuthorizationHeader 授权头
	AuthorizationHeader = "Authorization"
	// BearerPrefix Bearer前缀
	BearerPrefix = "Bearer "
	// UserIDKey 用户ID上下文键
	UserIDKey = "user_id"
	// EmailKey 邮箱上下文键
	EmailKey = "email"
)

// AuthRequired 认证中间件
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(AuthorizationHeader)
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "missing authorization header",
			})
			c.Abort()
			return
		}

		if !strings.HasPrefix(authHeader, BearerPrefix) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "invalid authorization format",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, BearerPrefix)
		
		jwtManager := jwt.GetManager()
		claims, err := jwtManager.ValidateAccessToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "invalid or expired token",
			})
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set(UserIDKey, claims.UserID)
		c.Set(EmailKey, claims.Email)

		c.Next()
	}
}

// OptionalAuth 可选认证中间件
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(AuthorizationHeader)
		if authHeader == "" {
			c.Next()
			return
		}

		if !strings.HasPrefix(authHeader, BearerPrefix) {
			c.Next()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, BearerPrefix)

		jwtManager := jwt.GetManager()
		claims, err := jwtManager.ValidateAccessToken(tokenString)
		if err == nil {
			c.Set(UserIDKey, claims.UserID)
			c.Set(EmailKey, claims.Email)
		}

		c.Next()
	}
}
