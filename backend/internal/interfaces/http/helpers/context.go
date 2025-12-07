package helpers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"unlimited-corp/internal/interfaces/http/middleware"
)

// GetUserID 从上下文中安全获取用户ID
func GetUserID(c *gin.Context) (uuid.UUID, bool) {
	val, exists := c.Get(middleware.UserIDKey)
	if !exists {
		return uuid.Nil, false
	}
	id, ok := val.(uuid.UUID)
	if !ok {
		return uuid.Nil, false
	}
	return id, true
}

// GetCompanyID 从上下文中安全获取公司ID
func GetCompanyID(c *gin.Context) (uuid.UUID, bool) {
	val, exists := c.Get(middleware.CompanyIDKey)
	if !exists {
		return uuid.Nil, false
	}
	id, ok := val.(uuid.UUID)
	if !ok {
		return uuid.Nil, false
	}
	return id, true
}

// MustGetUserID 获取用户ID，失败时返回错误响应
func MustGetUserID(c *gin.Context) (uuid.UUID, bool) {
	id, ok := GetUserID(c)
	if !ok {
		RespondError(c, 401, "unauthorized: user not found")
		return uuid.Nil, false
	}
	return id, true
}

// MustGetCompanyID 获取公司ID，失败时返回错误响应
func MustGetCompanyID(c *gin.Context) (uuid.UUID, bool) {
	id, ok := GetCompanyID(c)
	if !ok {
		RespondError(c, 400, "company context required")
		return uuid.Nil, false
	}
	return id, true
}

// ParseUUID 解析URL参数中的UUID
func ParseUUID(c *gin.Context, param string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(param))
	if err != nil {
		RespondError(c, 400, "invalid "+param)
		return uuid.Nil, false
	}
	return id, true
}

// GetUUID 解析URL参数中的UUID（不返回错误响应）
func GetUUID(c *gin.Context, param string) (uuid.UUID, bool) {
	id, err := uuid.Parse(c.Param(param))
	if err != nil {
		return uuid.Nil, false
	}
	return id, true
}
