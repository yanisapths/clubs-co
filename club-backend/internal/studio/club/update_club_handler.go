// internal/studio/club/update_club_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UpdateClub struct {
	repo UpdateClubRepo
}

func NewUpdateClub(repo UpdateClubRepo) *UpdateClub {
	return &UpdateClub{repo: repo}
}

func (s *UpdateClub) Handler(c *gin.Context) {
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

	var req UpdateClubRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	if len(req.Tags) > 3 {
		response.BadRequest(c, "cannot add more than 3 tags")
		return
	}

	err = s.repo.UpdateClub(c.Request.Context(), claims.UserID.String(), clubID, req)
	if err != nil {
		response.NotFound(c, "club not found")
		return
	}

	response.OK(c,nil)
}