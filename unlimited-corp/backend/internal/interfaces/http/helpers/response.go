package helpers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"unlimited-corp/pkg/errors"
)

// RespondError 返回错误响应
func RespondError(c *gin.Context, code int, message string) {
	c.JSON(code, gin.H{
		"code":    code,
		"message": message,
	})
}

// RespondSuccess 返回成功响应
func RespondSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": data,
	})
}

// HandleError 统一处理业务错误
func HandleError(c *gin.Context, err error) {
	if err == nil {
		return
	}

	switch {
	case errors.IsNotFound(err):
		RespondError(c, http.StatusNotFound, err.Error())
	case errors.IsConflict(err):
		RespondError(c, http.StatusConflict, err.Error())
	case errors.IsUnauthorized(err):
		RespondError(c, http.StatusForbidden, err.Error())
	case errors.IsBadRequest(err):
		RespondError(c, http.StatusBadRequest, err.Error())
	default:
		RespondError(c, http.StatusInternalServerError, "internal server error")
	}
}
