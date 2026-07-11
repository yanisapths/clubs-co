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
		s.logger.Warn("invalid update club request body",
			zap.Error(err),
			zap.Int64("clubId", clubID),
			zap.String("userId", claims.UserID.String()),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.BadRequest(c, "invalid request body")
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

	clubInfo, err := s.repo.GetClubByIDByOwnerId(c.Request.Context(), clubID, claims.UserID.String())
	if err != nil {
		s.logger.Error("failed: GetClubByID", zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.NotFound(c, "club not found")
		return
	}
	if clubInfo == nil {
		response.NotFound(c, "club not found")
		return
	}

	const maxCap = 200
	if req.MaxSeats != nil && *req.MaxSeats > maxCap {
		response.BadRequest(c, "seats limit exceeded")
		return
	}

	category, err := s.repo.GetCategoryById(c.Request.Context(), *req.CategoryID)
	if err != nil {
		s.logger.Error("failed: GetCategoryById", zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.NotFound(c, "category not found")
		return
	}
	if category == nil {
		response.NotFound(c, "category not found")
		return
	}

	if err := s.repo.UpdateClub(c.Request.Context(), claims.UserID.String(), clubID, req, *clubInfo); err != nil {
		switch {
		case errors.Is(err, ErrClubNotFound):
			response.NotFound(c, "club not found")
		case errors.Is(err, ErrClubNameTaken):
			response.Conflict(c, "club name already taken")
		default:
			s.logger.Error("failed: UpdateClub", zap.Error(err),
				zap.String("path", c.Request.URL.Path),
				zap.String("method", c.Request.Method),
			)
			response.InternalServerError(c, "internal server error")
		}
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