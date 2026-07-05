// club-backend/internal/membership/user/get_public_profile_handler.go

package user

import (
	"database/sql"
	"errors"

	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type getPublicProfileHandler struct {
	repo   GetPublicProfileRepo
	logger *zap.Logger
}

func NewGetPublicProfile(repo GetPublicProfileRepo, logger *zap.Logger) *getPublicProfileHandler {
	return &getPublicProfileHandler{repo: repo, logger: logger}
}

func (h *getPublicProfileHandler) Handler(c *gin.Context) {
	username := c.Param("username")
	if username == "" {
		response.BadRequest(c, "invalid username")
		return
	}

	profile, err := h.repo.GetPublicProfileByUsername(c.Request.Context(), username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			response.NotFound(c, "member not found")
			return
		}

		h.logger.Error(
			"failed : GetPublicProfileByUsername",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, "failed to get profile")
		return
	}

	displayName := ""
	if profile.DisplayName != nil {
		displayName = *profile.DisplayName
	}

	bio := ""
	if profile.Bio != nil {
		bio = *profile.Bio
	}

	imageURL := ""
	if profile.ImageURL != nil {
		imageURL = *profile.ImageURL
	}

	bannerURL := ""
	if profile.BannerURL != nil {
		bannerURL = *profile.BannerURL
	}

	resp := PublicProfileResponse{
		ID:          profile.ID,
		Username:    profile.Username,
		DisplayName: displayName,
		Bio:         bio,
		ImageURL:    imageURL,
		BannerURL:   bannerURL,
		SocialLinks: profile.SocialLinks,
		JoinedAt:    profile.JoinedAt.Unix(),
	}

	response.OK(c, resp)
}