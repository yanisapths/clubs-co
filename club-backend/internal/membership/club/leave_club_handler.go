package club

import (
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
)

type leaveClubHandler struct {
	repo LeaveClubRepo
}

func NewLeaveClub(repo LeaveClubRepo) *leaveClubHandler {
	return &leaveClubHandler{repo: repo}
}

func (h *leaveClubHandler) Handler(c *gin.Context) {
	userID := c.GetString("userID")
	if userID == "" {
		response.Unauthorized(c, "unauthorized")
		return
	}

	clubID, err := strconv.ParseInt(c.Param("clubID"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid club id")
		return
	}

	err = h.repo.LeaveClub(c.Request.Context(), userID, clubID)
	if err != nil {
		switch {
		case errors.Is(err, ErrNotMember):
			response.NotFound(c, err.Error())

		case errors.Is(err, ErrFounderCannotLeave):
			response.Conflict(c, err.Error())

		default:
			response.InternalServerError(c, "failed to leave club")
		}
		return
	}

	response.OK(c, nil)
}