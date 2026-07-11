package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type leaveClubHandler struct {
	repo LeaveClubRepo
	logger *zap.Logger
}

func NewLeaveClub(repo LeaveClubRepo,logger *zap.Logger) *leaveClubHandler {
	return &leaveClubHandler{repo: repo, logger:logger}
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
		h.logger.Error("failed: LeaveClub",
		zap.Error(err),
		zap.String("path", c.Request.URL.Path),
		zap.String("method", c.Request.Method),
	)	
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