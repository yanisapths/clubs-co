package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type getClubMemberListHandler struct {
	repo GetClubMemberListRepo
	logger *zap.Logger
}

func NewGetClubMemberList(repo GetClubMemberListRepo, logger *zap.Logger) *getClubMemberListHandler {
	return &getClubMemberListHandler{repo: repo,logger: logger}
}

func (h *getClubMemberListHandler) Handler(c *gin.Context) {
	var userID *string

	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			id := claims.UserID.String()
			userID = &id
		}
	}

	clubName := c.Param("club_name")
	if clubName == "" {
		response.BadRequest(c, "invalid club name")
		return
	}

	clubInfo, err := h.repo.GetClubByName(c.Request.Context(), userID, clubName)
	if err != nil {
		h.logger.Error(
			"failed : GetClubByName",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)

		response.NotFound(c, "club not found")
		return
	}
	
	isPrivileged := false

	if userID != nil {
		isPrivileged, err = h.repo.IsClubOwnerOrCoFounder(c.Request.Context(),clubInfo.ID,*userID)
		if err != nil {
			h.logger.Error(
				"failed : IsClubOwnerOrFounder",
				zap.Error(err),
				zap.String("path", c.Request.URL.Path),
				zap.String("method", c.Request.Method),
			)

			response.InternalServerError(c, "failed to validate permission")
			return
		}
	}

	members, err := h.repo.GetClubMemberByClubID(c.Request.Context(), clubInfo.ID, isPrivileged)
	if err != nil {
		h.logger.Error(
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