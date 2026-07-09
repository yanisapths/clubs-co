// club-backend/internal/studio/club/member/cancel_request_handler.go
package member

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type cancelRequestHandler struct {
	repo   MemberRepository
	logger *zap.Logger
}

func NewCancelRequest(repo MemberRepository, logger *zap.Logger) *cancelRequestHandler {
	return &cancelRequestHandler{repo: repo, logger: logger}
}

func (h *cancelRequestHandler) Handler(c *gin.Context) {
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

	memberID := c.Param("member_id")
	if memberID == "" {
		response.BadRequest(c, "invalid member id")
		return
	}

	if err := h.repo.CancelMemberRequest(c.Request.Context(), claims.UserID.String(), clubID, memberID); err != nil {
		switch {
		case errors.Is(err, ErrClubNotFound):
			response.NotFound(c, "club not found")
		case errors.Is(err, ErrNotClubOwner):
			response.Forbidden(c, "only the club owner can cancel requests or invitations")
		case errors.Is(err, ErrMemberRequestNotFound):
			response.NotFound(c, "no pending request or invitation found for this member")
		default:
			h.logger.Error("failed: CancelMemberRequest", zap.Error(err))
			response.InternalServerError(c, "internal server error")
		}
		return
	}

	response.OK(c, gin.H{"message": "request cancelled"})
}