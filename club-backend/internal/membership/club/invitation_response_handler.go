package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type invitationResponseHandler struct {
	repo InvitationResponseRepo
	logger *zap.Logger
}

func NewInvitationResponse(repo InvitationResponseRepo,logger *zap.Logger) *invitationResponseHandler {
	return &invitationResponseHandler{repo: repo,logger:logger}
}

func (h *invitationResponseHandler) Handler(c *gin.Context) {
	var userID string
	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			userID = claims.UserID.String()
		}
	}
	if userID == "" {
		response.Unauthorized(c, "unauthorized")
		return
	}

	clubID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid club id")
		return
	}

	var req InvitationResponse
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Warn("invalid invite response request body",
			zap.Error(err),
			zap.Int64("clubId", clubID),
			zap.String("userId", userID),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.BadRequest(c, "invalid request body")
		return
	}

	if _, err := h.repo.GetClubById(c.Request.Context(), int(clubID)); err != nil {
		switch {
		case errors.Is(err, ErrClubNotFound):
			response.NotFound(c, "club not found")
		default:
			response.InternalServerError(c, "internal server error")
		}
		return
	}

	if err := h.repo.ResponseToClubInvitation(c.Request.Context(), int(clubID), userID, req); err != nil {
		switch {
		case errors.Is(err, ErrInvitationNotFound):
			response.NotFound(c, "no invitation found")
		default:
			response.InternalServerError(c, "internal server error")
		}
		return
	}

	message := "invitation declined"
	if req.IsAccept {
		message = "joined club successfully"
	}
	response.OK(c, gin.H{"message": message})
}