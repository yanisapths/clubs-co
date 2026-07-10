package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type getClubListPaginated struct {
	repo   GetClubListPaginatedRepo
	logger *zap.Logger
}

func NewGetClubListPaginated(repo GetClubListPaginatedRepo, logger *zap.Logger) *getClubListPaginated {
	return &getClubListPaginated{repo: repo, logger: logger}
}

func (h *getClubListPaginated) Handler(c *gin.Context) {
	var userID *string
	limit, offset := parseLimitOffset(c, 12)

	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			id := claims.UserID.String()
			userID = &id
		}
	}

	clubs, totalRecords, err := h.repo.GetClubListPaginated(c.Request.Context(), userID, limit, offset)
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

	current := offset

	var prev *int
	if offset > 0 {
		p := max(0, offset-limit)
		prev = &p
	}

	nextOffset := offset + len(clubs)

	var next *int
	hasMore := nextOffset < totalRecords
	if hasMore {
		next = &nextOffset
	}

	totalPages := 0
	if limit > 0 {
		totalPages = (totalRecords + limit - 1) / limit
	}

	pagination := Pagination{
		Prev:         prev,
		Next:         next,
		Current:      &current,
		HasMore:      hasMore,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
	}

	clubResp := make([]ClubResponse, 0, len(clubs))

	for _, club := range clubs {
		description := ""
		if club.Description != nil {
			description = *club.Description
		}

		imageURL := ""
		if club.ImageURL != nil {
			imageURL = *club.ImageURL
		}

		clubResp = append(clubResp, ClubResponse{
			ID:           club.ID,
			Name:         club.Name,
			Description:  description,
			ImageURL:     imageURL,
			ClubType:     club.ClubType,
			Visibility:   club.Visibility,
			CategoryName: club.CategoryName,
			Tags:         club.Tags,
			CreatedAt:    club.CreatedAt.Unix(),
			IsMember:     club.IsMember,
			MemberCount:  club.MemberCount,
			Spaces:       club.Spaces,
		})
	}

	resp := GetClubListPaginatedResponse{
		Clubs:      clubResp,
		Pagination: pagination,
	}

	response.OK(c, resp)
}