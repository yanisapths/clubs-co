package profile

import (
	"club-backend/internal/auth"
	"club-backend/internal/file"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type DeleteUser struct {
	repo      DeleteUserRepo
	uploadSvc *file.UploadService
	logger    *zap.Logger
}

func NewDeleteUser(repo DeleteUserRepo, uploadSvc *file.UploadService, logger *zap.Logger) *DeleteUser {
	return &DeleteUser{repo: repo, uploadSvc: uploadSvc, logger: logger}
}

func (h *DeleteUser) Handler(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	ownerID := claims.UserID.String()
	ctx := c.Request.Context()

	assets, err := h.repo.GetUserAssetURLs(ctx, ownerID)
	if err != nil {
		h.logger.Warn("failed to collect user asset urls before deletion",
			zap.Error(err),
			zap.String("ownerID", ownerID),
		)
	}

	if err := h.repo.DeleteUser(ctx, ownerID); err != nil {
		h.logger.Error("failed: DeleteUser",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, "failed to delete user")
		return
	}

	if assets != nil {
		for _, url := range assets.AllURLs() {
			if err := h.uploadSvc.Delete(ctx, url); err != nil {
				h.logger.Warn("failed to delete asset from GCS",
					zap.Error(err),
					zap.String("url", url),
				)
			}
		}
	}

	response.OK(c, nil)
}