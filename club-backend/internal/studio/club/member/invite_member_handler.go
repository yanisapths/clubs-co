// club-backend/internal/studio/club/invite_member_handler.go
package member

import (
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
)

type inviteClubMemberHandler struct {
	repo MemberRepository
}

func NewInviteClubMember(repo MemberRepository) *inviteClubMemberHandler {
	return &inviteClubMemberHandler{repo: repo}
}

func (h *inviteClubMemberHandler) Handler(c *gin.Context) {
	inviterID := c.GetString("userID")
	if inviterID == "" {
		response.Unauthorized(c, "unauthorized")
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
		return
	}

	if err := h.repo.InviteClubMember(c.Request.Context(), inviterID, clubID, req); err != nil {
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

		default:
			response.InternalServerError(c, "internal server error")
		}
		return
	}

	response.Created(c, gin.H{
		"message": "invitation sent",
	})
}