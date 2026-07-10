package club

import (
	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type getClubListByCategorySlug struct {
	repo GetClubListByCategorySlugRepo
	logger *zap.Logger
}

func NewGetClubListByCategorySlug(repo GetClubListByCategorySlugRepo, logger *zap.Logger) *getClubListByCategorySlug {
	return &getClubListByCategorySlug{repo: repo,logger: logger}
}

func (h *getClubListByCategorySlug) Handler(c *gin.Context) {
	var userID *string
	limit, offset := parseLimitOffset(c, 12)

	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			id := claims.UserID.String()
			userID = &id
		}
	}

	categorySlug := c.Param("category_slug")
	if categorySlug == "" {
		response.BadRequest(c, "invalid category slug")
		return
	}

	category, err := h.repo.GetCategoryBySlug(c.Request.Context(), categorySlug)
	if err != nil {
		h.logger.Error(
			"failed to get category",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)

		response.InternalServerError(c, "failed to get category")
		return
	}
	if category == nil {
		response.NotFound(c, "category not found")
		return
	}
	
	categoryResp := ClubCategory{
		ID:        category.ID,
		Name:      category.Name,
		Slug:      category.Slug,
		Caption:   category.Caption,
	}

	clubs, totalRecords, err := h.repo.GetClubListByByCategorySlug(c.Request.Context(), userID, categorySlug, limit, offset)
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

	var resp GetClubByCategorySlugResponse
	resp = GetClubByCategorySlugResponse{
		Category:   categoryResp,
		Clubs: clubResp,
		Pagination: pagination,
	}

	response.OK(c, resp)
}