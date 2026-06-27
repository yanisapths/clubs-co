package profile

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type GetUserClubs struct {
	repo GetUserClubsRepo
}

func NewGetUserClubs(repo GetUserClubsRepo) *GetUserClubs {
	return &GetUserClubs{repo: repo}
}

func (h *GetUserClubs) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	clubs, err := h.repo.GetUserClubs(c.Request.Context(), claims.UserID.String())
	if err != nil {
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