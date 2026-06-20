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

func NewGetClubById(repo GetClubByIdRepo, 	logger *zap.Logger) *GetClubById {
	return &GetClubById{
		repo: repo,
		logger: logger,
	}
}

func (s *GetClubById) Handler(c *gin.Context) {
	var userID *string

	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			id := claims.UserID.String()
			userID = &id
		}
	}
	clubID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid club id")
		return
	}

	clubInfo, err := s.repo.GetClubByID(c.Request.Context(), userID, clubID)
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

	description := ""
	if clubInfo.Description != nil {
		description = *clubInfo.Description
	}

	imageURL := ""
	if clubInfo.ImageURL != nil {
		imageURL = *clubInfo.ImageURL
	}

	resp := GetClubByIDResponse{
		ClubInfo: ClubInfoResponse{
			ID:             clubInfo.ID,
			Owner:          clubInfo.Owner,
			Name:           clubInfo.Name,
			Description:    description,
			ImageURL:       imageURL,
			ClubType:       clubInfo.ClubType,
			Visibility:     clubInfo.Visibility,
			MaxSeats:       clubInfo.MaxSeats,
			AllowFollowers: clubInfo.AllowFollowers,
			Activate:       clubInfo.Activate,
			SocialLinks:    clubInfo.SocialLinks,
			SpaceIDs:       clubInfo.SpaceIDs,
			CategoryName:   clubInfo.CategoryName,
			Tags:           clubInfo.Tags,
			CreatedAt:      clubInfo.CreatedAt.Unix(),
			UpdatedAt:      clubInfo.UpdatedAt.Unix(),
			IsMember:       clubInfo.IsMember,
			MemberCount:    clubInfo.MemberCount,
		},
		Members: make([]Member, 0, len(members)),
	}

	for _, m := range members {
		resp.Members = append(resp.Members, Member{
			MemberUsername: m.MemberUsername,
			MemberID:       m.MemberID,
			Role:           m.Role,
			JoinedAt:       m.JoinedAt.Unix(),
		})
	}

	response.OK(c, resp)
}