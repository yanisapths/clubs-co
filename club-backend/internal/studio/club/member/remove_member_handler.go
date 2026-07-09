package member

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type removeClubMemberHandler struct {
	repo   MemberRepository
	logger *zap.Logger
}

func NewRemoveClubMember(repo MemberRepository, logger *zap.Logger) *removeClubMemberHandler {
	return &removeClubMemberHandler{repo: repo, logger: logger}
}

func (h *removeClubMemberHandler) Handler(c *gin.Context) {
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

	if err := h.repo.RemoveClubMember(c.Request.Context(), claims.UserID.String(), clubID, memberID); err != nil {
		switch {
		case errors.Is(err, ErrClubNotFound):
			response.NotFound(c, "club not found")
		case errors.Is(err, ErrNotClubOwner):
			response.Forbidden(c, "only the club owner can remove members")
		case errors.Is(err, ErrCannotRemoveFounder):
			response.Forbidden(c, "the club founder cannot be removed")
		case errors.Is(err, ErrMemberNotFound):
			response.NotFound(c, "member not found")
		default:
			h.logger.Error("failed: RemoveClubMember", zap.Error(err))
			response.InternalServerError(c, "internal server error")
		}
		return
	}

	response.OK(c, gin.H{"message": "member removed"})
}