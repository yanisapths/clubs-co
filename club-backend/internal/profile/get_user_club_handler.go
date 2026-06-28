package profile

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type GetUserClubs struct {
	repo GetUserClubsRepo
	logger *zap.Logger
}

func NewGetUserClubs(repo GetUserClubsRepo, logger *zap.Logger) *GetUserClubs {
	return &GetUserClubs{repo: repo,logger:logger}
}

func (h *GetUserClubs) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	clubs, err := h.repo.GetUserClubs(c.Request.Context(), claims.UserID.String())
	if err != nil {
		h.logger.Error("failed: GetUserClubs",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		
		response.NotFound(c, "clubs not found")
		
		return
	}


	stats := ClubStatsResponse{}
	items := make([]UserClubItem, 0, len(clubs))

	for _, club := range clubs {
		imageURL := ""
		if club.ClubImage != nil {
			imageURL = *club.ClubImage
		}

		items = append(items, UserClubItem{
			ID:          club.ClubID,
			ImageURL:    imageURL,
			Name:        club.ClubName,
			Role:        club.RoleName,
			MemberSince: club.JoinedAt.Unix(),
			Category:    club.Category,
		})

		switch club.RoleName {
		case "Founder":
			stats.ClubFounded++
		case "Co-Founder":
			stats.ClubMembership++
		default:
			stats.ClubJoined++
		}
	}
	
	response.OK(c, UserClubsResponse{
		Stats: stats,
		Clubs: items,
	})
}