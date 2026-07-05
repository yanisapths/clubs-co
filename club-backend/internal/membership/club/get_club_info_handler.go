package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type GetClubInfo struct {
	repo GetClubInfoRepo
	logger *zap.Logger
}

func NewGetClubInfo(repo GetClubInfoRepo, 	logger *zap.Logger) *GetClubInfo {
	return &GetClubInfo{
		repo: repo,
		logger: logger,
	}
}

func (s *GetClubInfo) Handler(c *gin.Context) {
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
	clubInfo, err := s.repo.GetClubByName(c.Request.Context(), userID, clubName)
	if err != nil {
		s.logger.Error(
			"failed : GetClubByName",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)

		response.NotFound(c, "club not found")
		return
	}

	members, err := s.repo.GetClubMemberByClubID(c.Request.Context(), clubInfo.ID)
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

	description := ""
	if clubInfo.Description != nil {
		description = *clubInfo.Description
	}

	imageURL := ""
	if clubInfo.ImageURL != nil {
		imageURL = *clubInfo.ImageURL
	}

	var joinedAt *int64

	if clubInfo.JoinedAt != nil {
		ts := clubInfo.JoinedAt.Unix()
		joinedAt = &ts
	}

	bannerURL := ""
	if clubInfo.BannerURL != nil {
		bannerURL = *clubInfo.BannerURL
	}

	resp := GetClubByIDResponse{
		ClubInfo: ClubInfoResponse{
			ID:             clubInfo.ID,
			Owner:          clubInfo.Owner,
			OwnerDisplayName: clubInfo.OwnerDisplayName,
			Name:           clubInfo.Name,
			Description:    description,
			ImageURL:       imageURL,
			BannerURL: 		&bannerURL,
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
			IsMember:       clubInfo.IsMember,
			IsPending: 		clubInfo.IsPending,
			MemberCount:    clubInfo.MemberCount,
			IsOwner: 		clubInfo.IsOwner,
			JoinedAt:	    joinedAt,
			MemberRole:     clubInfo.MemberRole,
		},
		Members: make([]Member, 0, len(members)),
	}

	for _, m := range members {
		resp.Members = append(resp.Members, Member{
			MemberDisplayName: m.MemberDisplayName,
			MemberUsername: m.MemberUsername,
			MemberID:       m.MemberID,
			Role:           m.Role,
			JoinedAt:       m.JoinedAt.Unix(),
		})
	}

	response.OK(c, resp)
}