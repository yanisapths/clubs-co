// club-backend/internal/studio/club/member/approve_request_handler.go
package member

import (
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type approveMemberRequestHandler struct {
	repo   MemberRepository
	logger *zap.Logger
}

func NewApproveMemberRequest(repo MemberRepository, logger *zap.Logger) *approveMemberRequestHandler {
	return &approveMemberRequestHandler{repo: repo, logger: logger}
}

func (h *approveMemberRequestHandler) Handler(c *gin.Context) {
	ownerID := c.GetString("userID")
	if ownerID == "" {
		response.Unauthorized(c, "unauthorized")
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

	if err := h.repo.ApproveMemberRequest(c.Request.Context(), ownerID, clubID, memberID); err != nil {
		switch {
		case errors.Is(err, ErrClubNotFound):
			response.NotFound(c, "club not found")
		case errors.Is(err, ErrNotClubOwner):
			response.Forbidden(c, "only the club owner can approve requests")
		case errors.Is(err, ErrMemberRequestNotFound):
			response.NotFound(c, "pending request not found for this member")
		default:
			h.logger.Error("failed: ApproveMemberRequest", zap.Error(err))
			response.InternalServerError(c, "internal server error")
		}
		return
	}

	response.OK(c, gin.H{"message": "member request approved"})
}