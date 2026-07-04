package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"errors"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

const clubImageDestPath = "club/images"

type CreateClub struct {
	repo      CreateClubRepo
	logger    *zap.Logger
}

func NewCreateClub(repo CreateClubRepo, logger *zap.Logger) *CreateClub {
	return &CreateClub{repo: repo, logger: logger}
}

func (s *CreateClub) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	var req CreateClubRequest
	if err := c.ShouldBind(&req); err != nil {
		response.BadRequest(c, response.ErrSomethingWentWrong.Error())
		return
	}

	if len(req.Tags) > 5 {
		response.BadRequest(c, "cannot add more than 5 tags")
		return
	}

	club, err := s.repo.CreateClub(c.Request.Context(), claims.UserID.String(), req)
	if err != nil {
		if errors.Is(err, ErrClubNameTaken) {
			response.Conflict(c, "club name already exists")
			return
		}
		s.logger.Error("failed : CreateClub",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, response.ErrSomethingWentWrong.Error())
		return
	}

	response.OK(c, CreateClubResponse{
		ID: club.ID,
	})
}