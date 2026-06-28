package user

import (
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type GetUserExist struct {
	repo   GetUserExistRepo
	logger *zap.Logger
}

func NewGetUserExist(repo GetUserExistRepo, logger *zap.Logger) *GetUserExist {
	return &GetUserExist{
		repo:   repo,
		logger: logger,
	}
}

func (s *GetUserExist) Handler(c *gin.Context) {
	email := c.Query("email")
	username := c.Query("username")

	if email == "" && username == "" {
		response.InternalServerError(c, "email or username is required")
		return
	}

	var emailPtr *string
	var usernamePtr *string

	if email != "" {
		emailPtr = &email
	}

	if username != "" {
		usernamePtr = &username
	}

	exist, err := s.repo.GetExistUser(c.Request.Context(), emailPtr, usernamePtr)
	if err != nil {
		response.InternalServerError(c, response.ErrSomethingWentWrong.Error())
		return
	}

	response.OK(c, gin.H{
		"exist": exist,
	})
}