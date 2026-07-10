// internal/studio/club/get_club_list_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type getClubMemberListById struct {
	repo GetClubMemberListByIdRepo
	logger *zap.Logger
}

func NewGetClubMemberListById(repo GetClubMemberListByIdRepo, logger *zap.Logger) *getClubMemberListById {
	return &getClubMemberListById{
		repo: repo,
		logger: logger,
	}
}

func (s *getClubMemberListById) Handler(c *gin.Context) {
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

	clubInfo, err := s.repo.GetClubByIDByOwnerId(c.Request.Context(), clubID, claims.UserID.String())
	if err != nil {
		s.logger.Error(
			"failed : GetClubByID",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
	
		response.NotFound(c, "club not found")
		return
	}
	if clubInfo == nil {
		s.logger.Error(
			"failed : GetClubByID",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
	
		response.NotFound(c, "club not found")
		return

	}

	members, err := s.repo.GetClubMemberByClubID(c.Request.Context(), clubID)
	if err != nil {
		s.logger.Error(
			"failed : GetClubMemberByClubID",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
	
		response.InternalServerError(c, "failed to load members")
		return
	}

	resp := ClubMemberResponse{
		Members: make([]Member, 0, len(members)),
	}
	
	for _, m := range members {
		resp.Members = append(resp.Members, Member{
			MemberDisplayName: m.MemberDisplayName,
			MemberUsername:    m.MemberUsername,
			MemberID:          m.MemberID,
			Role:              m.Role,
			JoinedAt:          m.JoinedAt.Unix(),
			IsPending:         m.IsPending,
			IsInvited:         m.IsInvited,
		})
	}

	response.OK(c, resp)
}