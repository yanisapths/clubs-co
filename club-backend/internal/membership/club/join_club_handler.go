package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type joinClubHandler struct {
	repo JoinClubRepo
}

func NewJoinClub(repo JoinClubRepo) *joinClubHandler {
	return &joinClubHandler{repo: repo}
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