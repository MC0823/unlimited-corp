package middleware

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CompanyService interface for company operations
type CompanyService interface {
	GetCompanyIDByUserID(ctx context.Context, userID uuid.UUID) (uuid.UUID, error)
}

// CompanyRequired middleware that loads the user's company and sets company_id in context
func CompanyRequired(companyService CompanyService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get(UserIDKey)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "user not authenticated",
			})
			c.Abort()
			return
		}

		companyID, err := companyService.GetCompanyIDByUserID(c.Request.Context(), userID.(uuid.UUID))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"code":    400,
				"message": "company not found, please create a company first",
			})
			c.Abort()
			return
		}

		c.Set(CompanyIDKey, companyID)
		c.Next()
	}
}
