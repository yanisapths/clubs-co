// club-backend/internal/membership/club/join_club_handler.go
package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type joinClubHandler struct {
	repo JoinClubRepo
	logger *zap.Logger
}

func NewJoinClub(repo JoinClubRepo,	logger *zap.Logger) *joinClubHandler {
	return &joinClubHandler{repo: repo, logger:logger}
}

func (h *joinClubHandler) Handler(c *gin.Context) {
	var userID string
	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			userID = claims.UserID.String()
		}
	}

	clubID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		response.BadRequest(c, "invalid club id")
		return
	}

	status, err := h.repo.JoinClub(c.Request.Context(), userID, clubID)
	
	if err != nil {
		h.logger.Error("failed: JoinClub",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)	
		switch {
		case errors.Is(err, ErrClubNotFound):
			c.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		case errors.Is(err, ErrClubNotPublic):
			c.JSON(http.StatusForbidden, gin.H{"message": err.Error()})
		case errors.Is(err, ErrClubFull):
			c.JSON(http.StatusConflict, gin.H{"message": err.Error()})
		case errors.Is(err, ErrAlreadyMember):
			c.JSON(http.StatusConflict, gin.H{"message": err.Error()})
		case errors.Is(err, ErrRequestPending):
			c.JSON(http.StatusConflict, gin.H{"message": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to join club"})
		}
		return
	}

	if status == "Pending" {
		
		response.Created(c, gin.H{"message": "join request sent, pending approval"})
		return
	}

	response.Created(c, gin.H{"message": "joined club successfully"})
}