package club

import (
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
	userID := c.GetString("userID")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "unauthorized",
		})
		return
	}

	clubID, err := strconv.ParseInt(c.Param("clubID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid club id",
		})
		return
	}

	err = h.repo.JoinClub(c.Request.Context(), userID, clubID)
	if err != nil {
		switch {
		case errors.Is(err, ErrClubNotFound):
			c.JSON(http.StatusNotFound, gin.H{
				"message": err.Error(),
			})
		case errors.Is(err, ErrClubNotPublic):
			c.JSON(http.StatusForbidden, gin.H{
				"message": err.Error(),
			})
		case errors.Is(err, ErrClubFull):
			c.JSON(http.StatusConflict, gin.H{
				"message": err.Error(),
			})
		case errors.Is(err, ErrAlreadyMember):
			c.JSON(http.StatusConflict, gin.H{
				"message": err.Error(),
			})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "failed to join club",
			})
		}
		return
	}

	response.OK(c,nil)
}	