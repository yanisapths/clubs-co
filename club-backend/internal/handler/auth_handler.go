package handler

import (
	"errors"

	"club-backend/internal/auth"
	"club-backend/internal/service"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type AuthHandler struct {
	authSvc service.AuthService
	logger *zap.Logger

}

func NewAuthHandler(authSvc service.AuthService, logger *zap.Logger) *AuthHandler {
	return &AuthHandler{authSvc: authSvc,logger:logger}
}

// RegisterRoutes wires auth endpoints under the provided router group.
func (h *AuthHandler) RegisterRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")
	{
		auth.POST("/signup", h.SignUp)
		auth.POST("/login", h.Login)
	}
}

// SignUp godoc
//
//	@Summary     Register a new user
//	@Tags        auth
//	@Accept      json
//	@Produce     json
//	@Param       body body service.SignUpRequest true "Sign-up payload"
//	@Success     201 {object} service.AuthResponse
//	@Failure     400 {object} response.ErrorBody
//	@Failure     409 {object} response.ErrorBody
//	@Router      /auth/signup [post]
func (h *AuthHandler) SignUp(c *gin.Context) {
	var req service.SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Warn("invalid signup request body",
		zap.Error(err),
		zap.String("path", c.Request.URL.Path),
		zap.String("method", c.Request.Method),
	)}

	res, err := h.authSvc.SignUp(c.Request.Context(), &req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrEmailTaken), errors.Is(err, service.ErrUsernameTaken):
			response.Conflict(c, err.Error())
		default:
			response.InternalServerError(c, "signup failed")
		}
		return
	}

	response.Created(c, res)
}

// Login godoc
//
//	@Summary     Authenticate a user
//	@Tags        auth
//	@Accept      json
//	@Produce     json
//	@Param       body body service.LoginRequest true "Login payload"
//	@Success     200 {object} service.AuthResponse
//	@Failure     400 {object} response.ErrorBody
//	@Failure     401 {object} response.ErrorBody
//	@Router      /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Warn("invalid login request body",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.BadRequest(c, "invalid request body")
		return
	}

	res, err := h.authSvc.Login(c.Request.Context(), &req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidCredentials):
			response.Unauthorized(c, "invalid credentials")
		case errors.Is(err, service.ErrAccountInactive):
			response.Unauthorized(c, "account is inactive")
		default:
			response.InternalServerError(c, "login failed")
		}
		return
	}

	response.OK(c, res)
}

// Me returns the currently authenticated user's profile.
func (h *AuthHandler) Me(c *gin.Context) {
	claims, ok := c.MustGet("claims").(*auth.Claims)
	if !ok {
		response.Unauthorized(c, "invalid token claims")
		return
	}

	userID, err := uuid.Parse(claims.UserID.String())
	if err != nil {
		response.BadRequest(c, "invalid user id")
		return
	}

	// In a full implementation: call authSvc.GetUserByID and return full profile.
	response.OK(c, gin.H{
		"user_id": userID,
		"email":   claims.Email,
	})
}