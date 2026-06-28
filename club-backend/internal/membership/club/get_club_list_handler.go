package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type getClubListHandler struct {
	repo GetClubListRepo
	logger *zap.Logger
}

func NewGetClubList(repo GetClubListRepo, logger *zap.Logger) *getClubListHandler {
	return &getClubListHandler{repo: repo,logger: logger}
}

func (h *getClubListHandler) Handler(c *gin.Context) {
	var userID *string

	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			id := claims.UserID.String()
			userID = &id
		}
	}

	clubs, err := h.repo.GetClubList(c.Request.Context(), userID)
	if err != nil {
		h.logger.Error(
			"failed to get clubs",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)

		response.InternalServerError(c, "failed to get clubs")
		return
	}

	resp := make([]ClubResponse, 0, len(clubs))

	for _, club := range clubs {
		description := ""
		if club.Description != nil {
			description = *club.Description
		}

		imageURL := ""
		if club.ImageURL != nil {
			imageURL = *club.ImageURL
		}

		resp = append(resp, ClubResponse{
			ID:             club.ID,
			Name:           club.Name,
			Description:    description,
			ImageURL:       imageURL,
			ClubType:       club.ClubType,
			Visibility:     club.Visibility,
			CategoryName:   club.CategoryName,
			Tags:           club.Tags,
			CreatedAt:      club.CreatedAt.Unix(),
			IsMember:       club.IsMember,
			MemberCount:    club.MemberCount,
			Spaces:         club.Spaces,	
		})
	}

	response.OK(c, resp)
}