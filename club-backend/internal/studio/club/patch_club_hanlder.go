// internal/studio/club/patch_club_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/internal/file"
	"club-backend/pkg/response"
	"errors"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type PatchClub struct {
	repo      PatchClubByIdRepo
	uploadSvc *file.UploadService
	logger    *zap.Logger
}

func NewPatchClub(repo PatchClubByIdRepo, uploadSvc *file.UploadService, logger *zap.Logger) *PatchClub {
	return &PatchClub{repo: repo, uploadSvc: uploadSvc, logger: logger}
}

func (s *PatchClub) Handler(c *gin.Context) {
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

	var req PatchClubRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	if len(req.Tags) > 5 {
		response.BadRequest(c, "cannot add more than 5 tags")
		return
	}

	var oldImageURL *string
	if req.ThumbnailImage.Present {
		oldImageURL, err = s.repo.GetClubImageURL(c.Request.Context(), clubID, claims.UserID.String())
		if err != nil {
			s.logger.Error("failed to get club image url", zap.Error(err))
		}
	}
	var oldBannerURL *string
	if req.BannerURL.Present {
		oldBannerURL, err = s.repo.GetClubBannerURL(c.Request.Context(), clubID, claims.UserID.String())
		if err != nil {
			s.logger.Error("failed to get club banner url", zap.Error(err))
		}
	}

	patchResult, err := s.repo.PatchClub(c.Request.Context(), claims.UserID.String(), clubID, req)
	if err != nil {
		if errors.Is(err, ErrClubNotFound) {
			response.NotFound(c, "club not found")
			return
		}
		if errors.Is(err, ErrClubNameTaken) {
			response.Conflict(c, "club name already exists")
			return
		}
		if errors.Is(err, ErrTooManyGalleryImages) {
			response.BadRequest(c, err.Error())
			return
		}
		s.logger.Error("failed: PatchClub", zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, err.Error())
		return
	}

	if oldImageURL != nil && *oldImageURL != "" {
		if err := s.uploadSvc.Delete(c.Request.Context(), *oldImageURL); err != nil {
			s.logger.Warn("failed to delete old club image from GCS", zap.Error(err), zap.String("url", *oldImageURL))
		}
	}

	if oldBannerURL != nil && *oldBannerURL != "" {
		if err := s.uploadSvc.Delete(c.Request.Context(), *oldBannerURL); err != nil {
			s.logger.Warn("failed to delete old club banner from GCS", zap.Error(err), zap.String("url", *oldBannerURL))
		}
	}

	if oldImageURL != nil && *oldImageURL != "" {
		if err := s.uploadSvc.Delete(c.Request.Context(), *oldImageURL); err != nil {
			s.logger.Warn("failed to delete old club image from GCS",
				zap.Error(err),
				zap.String("url", *oldImageURL),
			)
		}
	}

	for _, url := range patchResult.GalleryURLsToDelete {
		if err := s.uploadSvc.Delete(c.Request.Context(), url); err != nil {
			s.logger.Warn("failed to delete removed gallery image from GCS",
				zap.Error(err),
				zap.String("url", url),
			)
		}
	}

	for _, warnErr := range patchResult.PromotionWarnings {
		s.logger.Warn("gallery image promoted but temp object cleanup failed",
			zap.Error(warnErr),
		)
	}

	response.OK(c, nil)
}