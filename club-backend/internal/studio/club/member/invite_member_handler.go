// club-backend/internal/studio/club/invite_member_handler.go
package member

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type inviteClubMemberHandler struct {
	repo MemberRepository
	logger *zap.Logger
}

func NewInviteClubMember(repo MemberRepository, logger *zap.Logger) *inviteClubMemberHandler {
	return &inviteClubMemberHandler{repo: repo,logger:logger}
}

func (h *inviteClubMemberHandler) Handler(c *gin.Context) {
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

	var req InviteClubMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		h.logger.Error("failed : invalid request body",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		return
	}

	if err := h.repo.InviteClubMember(c.Request.Context(), claims.UserID.String(), clubID, req); err != nil {
		switch {
		case errors.Is(err, ErrClubNotFound):
			response.NotFound(c, "club not found")

		case errors.Is(err, ErrNotClubOwner):
			response.Forbidden(c, "only the club owner can send invitations")

		case errors.Is(err, ErrInvalidInviteRole):
			response.BadRequest(c, "invited role must be co-founder or member")

		case errors.Is(err, ErrAlreadyMember):
			response.Conflict(c, "user is already a club member")

		case errors.Is(err, ErrInviteAlreadyPending):
			response.Conflict(c, "an invitation is already pending for this user")
		
		case errors.Is(err, ErrUserAlreadyRequestedToJoin):
			response.Conflict(c, "member already requested to join")

		case errors.Is(err, ErrClubFull):
			response.Conflict(c, "club is already full")
			
		default:
			response.InternalServerError(c, "internal server error")
		}
		h.logger.Error("failed : InviteClubMember",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		return
	}

	response.Created(c, gin.H{
		"message": "invitation sent",
	})
}