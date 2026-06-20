// internal/studio/club/create_club_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type CreateClub struct {
	repo CreateClubRepo
}

func NewCreateClub(repo CreateClubRepo) *CreateClub {
	return &CreateClub{repo: repo}
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

	if len(req.Tags) > 3 {
		response.BadRequest(c, "cannot add more than 3 tags")
		return
	}

	club, err := s.repo.CreateClub(c.Request.Context(), claims.UserID.String(), req)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, CreateClubResponse{
		ID:          club.ID,
	})
}