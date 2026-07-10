// internal/studio/club/get_club_list_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type GetClubById struct {
	repo GetClubByIdRepo
	logger *zap.Logger
}

func NewGetClubById(repo GetClubByIdRepo, logger *zap.Logger) *GetClubById {
	return &GetClubById{
		repo: repo,
		logger: logger,
	}
}

func (s *GetClubById) Handler(c *gin.Context) {
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

	description := ""
	if clubInfo.Description != nil {
		description = *clubInfo.Description
	}

	imageURL := ""
	if clubInfo.ImageURL != nil {
		imageURL = *clubInfo.ImageURL
	}

	bannerURL := ""
	if clubInfo.BannerURL != nil {
		bannerURL = *clubInfo.BannerURL
	}

	resp := GetClubByIDResponse{
		ClubInfo: ClubResponse{
			ID:             clubInfo.ID,
			Owner:          clubInfo.Owner,
			Name:           clubInfo.Name,
			Description:    description,
			ImageURL:       imageURL,
			BannerURL:      bannerURL,
			GalleryURLs: 	clubInfo.GalleryURLs,
			ClubType:       clubInfo.ClubType,
			Visibility:     clubInfo.Visibility,
			MaxSeats:       clubInfo.MaxSeats,
			AllowFollowers: clubInfo.AllowFollowers,
			Activate:       clubInfo.Activate,
			SocialLinks:    clubInfo.SocialLinks,
			Spaces:       clubInfo.Spaces,
			Category:   ClubCategory{
				ID: 	 clubInfo.CategoryID,
				Name: 	 clubInfo.CategoryName,
			},
			Tags:           clubInfo.Tags,
			CreatedAt:      clubInfo.CreatedAt.Unix(),
			UpdatedAt:      clubInfo.UpdatedAt.Unix(),
			OwnerDisplayName: clubInfo.OwnerDisplayName,
			MemberCount: 		clubInfo.MemberCount,	
			PendingMemberCount: clubInfo.PendingMemberCount,
			PendingInviteCount: clubInfo.PendingInviteCount,
		},
	
	}

	

	response.OK(c, resp)
}