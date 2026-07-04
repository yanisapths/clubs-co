// internal/studio/club/get_club_list_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type GetClub struct {
	repo GetClubRepo
}

func NewGetClub(repo GetClubRepo) *GetClub {
	return &GetClub{repo: repo}
}

func (s *GetClub) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	clubs, err := s.repo.GetListClubByOwnerID(c.Request.Context(), claims.UserID.String())
	if err != nil {
		response.NotFound(c, "club not found")
		return
	}

	result := make([]ClubResponse, 0, len(clubs))
	for _, club := range clubs {
		description := ""
		if club.Description != nil {
			description = *club.Description
		}

		imageURL := ""
		if club.ImageURL != nil {
			imageURL = *club.ImageURL
		}
		
		
		item := ClubResponse{
			ID:             club.ID,
			Owner:          club.Owner,
			Name:           club.Name,
			Description:    description,
			ImageURL:       imageURL,
			ClubType:       club.ClubType,
			Visibility:     club.Visibility,
			MaxSeats:       club.MaxSeats,
			AllowFollowers: club.AllowFollowers,
			Activate:       club.Activate,
			SocialLinks:    club.SocialLinks,
			Spaces:       club.Spaces,
			Category:   ClubCategory{
				ID: 	 club.CategoryID,
				Name: 	 club.CategoryName,
			},
			Tags:           club.Tags,
			CreatedAt:      club.CreatedAt.Unix(),
			UpdatedAt:      club.UpdatedAt.Unix(),
			MemberCount:    club.MemberCount,
		}
		result = append(result, item)
	}

	response.OK(c, result)
}
