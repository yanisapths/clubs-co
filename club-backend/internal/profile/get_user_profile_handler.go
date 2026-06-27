package profile

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"encoding/json"

	"github.com/gin-gonic/gin"
)

type GetUserProfile struct {
	repo GetUserProfileRepo
}

func NewGetUserProfile(repo GetUserProfileRepo) *GetUserProfile {
	return &GetUserProfile{repo: repo}
}

func (h *GetUserProfile) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	user, err := h.repo.GetUserInfo(c.Request.Context(), claims.UserID.String())
	if err != nil {
		response.NotFound(c, "user not found")
		return
	}

	deref := func(s *string) string {
		if s != nil {
			return *s
		}
		return ""
	}

	var socialLinks json.RawMessage = []byte("[]")
	if user.SocialLinks != nil {
		socialLinks = user.SocialLinks
	}

	resp := UserInfoResponse{
		FirstName:   deref(user.FirstName),
		LastName:    deref(user.LastName),
		DisplayName: deref(user.DisplayName),
		Username:    user.Username,
		SocialLinks: socialLinks,
		JoinedAt:    user.CreatedAt.Unix(),
		ImageURL:    deref(user.ImageURL),
		Bio:         deref(user.Bio),
		BannerURL:   deref(user.BannerURL),
		Email:       user.Email,
	}

	response.OK(c, resp)
}