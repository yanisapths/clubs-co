package profile

import (
	"club-backend/internal/auth"
	"club-backend/internal/file"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UpdateUserProfile struct {
	repo      PatchUserProfileRepo
	uploadSvc *file.UploadService
	logger    *zap.Logger
}

func NewUpdateUserProfile(repo PatchUserProfileRepo, uploadSvc *file.UploadService, logger *zap.Logger) *UpdateUserProfile {
	return &UpdateUserProfile{repo: repo, uploadSvc: uploadSvc, logger: logger}
}

func (h *UpdateUserProfile) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	var req PatchUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	ownerID := claims.UserID.String()

	var oldImageURL, oldBannerURL *string
	if req.ImageURL != nil || req.BannerURL != nil {
		urls, err := h.repo.GetUserImageURLs(c.Request.Context(), ownerID)
		if err != nil {
			h.logger.Warn("failed to fetch current user image urls before patch",
				zap.Error(err),
				zap.String("ownerID", ownerID),
			)
		} else {
			if req.ImageURL != nil {
				oldImageURL = urls.ImageURL
			}
			if req.BannerURL != nil {
				oldBannerURL = urls.BannerURL
			}
		}
	}

	if err := h.repo.PatchUser(c.Request.Context(), ownerID, req); err != nil {
		h.logger.Error("failed: PatchUser",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, "failed to update profile")
		return
	}

	if oldImageURL != nil && *oldImageURL != "" {
		if err := h.uploadSvc.Delete(c.Request.Context(), *oldImageURL); err != nil {
			h.logger.Warn("failed to delete old user image from GCS",
				zap.Error(err),
				zap.String("url", *oldImageURL),
			)
		}
	}
	if oldBannerURL != nil && *oldBannerURL != "" {
		if err := h.uploadSvc.Delete(c.Request.Context(), *oldBannerURL); err != nil {
			h.logger.Warn("failed to delete old user banner from GCS",
				zap.Error(err),
				zap.String("url", *oldBannerURL),
			)
		}
	}

	response.OK(c, nil)
}