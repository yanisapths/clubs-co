package club

import (
	"club-backend/internal/auth"
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
	var userID string

	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			id := claims.UserID.String()
			userID = id
		}
	}

	clubID, err := strconv.ParseInt(c.Param("id"), 10, 64)
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