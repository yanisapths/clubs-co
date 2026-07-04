package club

import (
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type GetClubExist struct {
	repo   GetClubExistRepo
	logger *zap.Logger
}

func NewGetClubExist(repo GetClubExistRepo, logger *zap.Logger) *GetClubExist {
	return &GetClubExist{
		repo:   repo,
		logger: logger,
	}
}

func (s *GetClubExist) Handler(c *gin.Context) {
	name := c.Query("name")

	if name == "" {
		response.InternalServerError(c, "name is required")
		return
	}

	var namePtr *string
	

	if name != "" {
		namePtr = &name
	}

	exist, err := s.repo.GetExistClub(c.Request.Context(), namePtr)
	if err != nil {
		s.logger.Error("failed : GetExistClub",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, response.ErrSomethingWentWrong.Error())
		return
	}

	response.OK(c, gin.H{
		"exist": exist,
	})
}