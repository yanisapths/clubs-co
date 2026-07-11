// internal/studio/club/delete_club_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type DeleteClub struct {
	repo DeleteClubRepo
	logger *zap.Logger
}

func NewDeleteClub(repo DeleteClubRepo,logger *zap.Logger) *DeleteClub {
	return &DeleteClub{repo: repo,logger:logger}
}

func (s *DeleteClub) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	clubID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid club id")
		return
	}

	err = s.repo.DeleteClub(c.Request.Context(), claims.UserID.String(), clubID)
	if err != nil {
		s.logger.Error("failed: DeleteClub",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.NotFound(c, "club not found")
		return
	}

	response.OK(c, nil)
}