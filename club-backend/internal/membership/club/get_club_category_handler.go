// club-backend/internal/membership/club/get_club_category_handler.go
package club

import (
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type getClubCategoryHandler struct {
	repo   GetClubCategoryRepo
	logger *zap.Logger
}

func NewGetClubCategoryList(repo GetClubCategoryRepo, logger *zap.Logger) *getClubCategoryHandler {
	return &getClubCategoryHandler{repo: repo, logger: logger}
}

func (h *getClubCategoryHandler) Handler(c *gin.Context) {
	categories, err := h.repo.GetClubCategoryList(c.Request.Context())
	if err != nil {
		h.logger.Error(
			"failed to get club categories",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)

		response.InternalServerError(c, "failed to get club categories")
		return
	}

	response.OK(c, categories)
}