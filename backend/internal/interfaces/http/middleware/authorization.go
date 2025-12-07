package middleware

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"unlimited-corp/internal/interfaces/http/helpers"
)

// ResourceOwnershipChecker 资源所有权检查接口
type ResourceOwnershipChecker interface {
	CheckEmployeeOwnership(ctx context.Context, employeeID, companyID uuid.UUID) (bool, error)
	CheckSkillCardOwnership(ctx context.Context, skillCardID, companyID uuid.UUID) (bool, error)
	CheckTaskOwnership(ctx context.Context, taskID, companyID uuid.UUID) (bool, error)
}

// ResourceOwnership 检查资源所有权的中间件
func ResourceOwnership(checker ResourceOwnershipChecker, resourceType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		companyID, ok := helpers.GetCompanyID(c)
		if !ok {
			helpers.RespondError(c, 400, "company context required")
			c.Abort()
			return
		}

		resourceID, ok := helpers.GetUUID(c, "id")
		if !ok {
			helpers.RespondError(c, 400, "invalid resource id")
			c.Abort()
			return
		}

		var owned bool
		var err error

		switch resourceType {
		case "employee":
			owned, err = checker.CheckEmployeeOwnership(c.Request.Context(), resourceID, companyID)
		case "skillcard":
			owned, err = checker.CheckSkillCardOwnership(c.Request.Context(), resourceID, companyID)
		case "task":
			owned, err = checker.CheckTaskOwnership(c.Request.Context(), resourceID, companyID)
		default:
			helpers.RespondError(c, 500, "unknown resource type")
			c.Abort()
			return
		}

		if err != nil {
			helpers.HandleError(c, err)
			c.Abort()
			return
		}

		if !owned {
			helpers.RespondError(c, 403, "access denied")
			c.Abort()
			return
		}

		c.Next()
	}
}
