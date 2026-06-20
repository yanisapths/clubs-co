// internal/studio/club/create_club_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type CreateClub struct {
	repo CreateClubRepo
	logger *zap.Logger
}

func NewCreateClub(repo CreateClubRepo,logger *zap.Logger) *CreateClub {
	return &CreateClub{repo: repo,logger:logger}
}

func (s *CreateClub) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	var req CreateClubRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	if len(req.Tags) > 5 {
		response.BadRequest(c, "cannot add more than 5 tags")
		return
	}

	club, err := s.repo.CreateClub(c.Request.Context(), claims.UserID.String(), req)
	if err != nil {
		s.logger.Error(
			"failed : CreateClub",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
	
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, CreateClubResponse{
		ID:          club.ID,
	})
}