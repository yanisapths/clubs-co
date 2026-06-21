// internal/studio/club/update_club_handler.go
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

type UpdateClub struct {
	repo      UpdateClubRepo
	uploadSvc *file.UploadService
	logger    *zap.Logger
}

func NewUpdateClub(repo UpdateClubRepo, uploadSvc *file.UploadService, logger *zap.Logger) *UpdateClub {
	return &UpdateClub{repo: repo, uploadSvc: uploadSvc, logger: logger}
}

func (s *UpdateClub) Handler(c *gin.Context) {
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

	var req UpdateClubRequest
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

	if err := s.repo.UpdateClub(c.Request.Context(), claims.UserID.String(), clubID, req); err != nil {
		if errors.Is(err, ErrClubNotFound) {
			response.NotFound(c, "club not found")
			return
		}
		s.logger.Error("failed: UpdateClub", zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, err.Error())
		return
	}
	
	if oldImageURL != nil && *oldImageURL != "" {
		if err := s.uploadSvc.Delete(c.Request.Context(), *oldImageURL); err != nil {
			s.logger.Warn("failed to delete old club image from GCS",
				zap.Error(err),
				zap.String("url", *oldImageURL),
			)
		}
	}

	response.OK(c, nil)
}