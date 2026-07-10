// club-backend/internal/membership/club/search_club_handler.go
package club

import (
	"strconv"
	"strings"

	"club-backend/internal/auth"
	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

const (
	defaultSearchLimit = 20
	maxSearchLimit     = 100
)

type searchHandler struct {
	repo   SearchRepo
	logger *zap.Logger
}

func NewSearchClubList(repo SearchRepo, logger *zap.Logger) *searchHandler {
	return &searchHandler{repo: repo, logger: logger}
}

func parseLimitOffset(c *gin.Context, defaultSearchLimit int) (limit, offset int) {
	limit = defaultSearchLimit
	if raw := c.Query("limit"); raw != "" {
		if v, err := strconv.Atoi(raw); err == nil && v > 0 {
			limit = v
		}
	}
	if limit > maxSearchLimit {
		limit = maxSearchLimit
	}

	offset = 0
	if raw := c.Query("offset"); raw != "" {
		if v, err := strconv.Atoi(raw); err == nil && v >= 0 {
			offset = v
		}
	}
	return limit, offset
}

func (h *searchHandler) Handler(c *gin.Context) {
	var userID *string
	if claimsValue, exists := c.Get("claims"); exists {
		if claims, ok := claimsValue.(*auth.Claims); ok {
			id := claims.UserID.String()
			userID = &id
		}
	}

	query := strings.TrimSpace(c.Query("q"))
	limit, offset := parseLimitOffset(c, defaultSearchLimit)

	logFields := []zap.Field{
		zap.String("path", c.Request.URL.Path),
		zap.String("method", c.Request.Method),
		zap.String("query", query),
		zap.Int("limit", limit),
		zap.Int("offset", offset),
	}

	clubs, err := h.repo.SearchClubs(c.Request.Context(), userID, query, limit, offset)
	if err != nil {
		h.logger.Error("failed to search clubs", append(logFields, zap.Error(err))...)
		response.InternalServerError(c, "failed to search")
		return
	}

	members, err := h.repo.SearchMembers(c.Request.Context(), query, limit, offset)
	if err != nil {
		h.logger.Error("failed to search members", append(logFields, zap.Error(err))...)
		response.InternalServerError(c, "failed to search")
		return
	}

	spaces, err := h.repo.SearchSpaces(c.Request.Context(), query, limit, offset)
	if err != nil {
		h.logger.Error("failed to search spaces", append(logFields, zap.Error(err))...)
		response.InternalServerError(c, "failed to search")
		return
	}

	categories, err := h.repo.SearchCategories(c.Request.Context(), query, limit, offset)
	if err != nil {
		h.logger.Error("failed to search categories", append(logFields, zap.Error(err))...)
		response.InternalServerError(c, "failed to search")
		return
	}

	resp := SearchResponse{
		Clubs:      make([]ClubResponse, 0, len(clubs)),
		Members:    make([]MemberSearchResponse, 0, len(members)),
		Spaces:     make([]SpaceSearchResponse, 0, len(spaces)),
		Categories: categories,
	}

	for _, cl := range clubs {
		description := ""
		if cl.Description != nil {
			description = *cl.Description
		}
		imageURL := ""
		if cl.ImageURL != nil {
			imageURL = *cl.ImageURL
		}

		resp.Clubs = append(resp.Clubs, ClubResponse{
			ID:           cl.ID,
			Name:         cl.Name,
			Description:  description,
			ImageURL:     imageURL,
			ClubType:     cl.ClubType,
			Visibility:   cl.Visibility,
			CategoryName: cl.CategoryName,
			Tags:         cl.Tags,
			Spaces:       cl.Spaces,
			CreatedAt:    cl.CreatedAt.Unix(),
			IsMember:     cl.IsMember,
			MemberCount:  cl.MemberCount,
		})
	}

	for _, m := range members {
		imageURL := ""
		if m.ImageURL != nil {
			imageURL = *m.ImageURL
		}
		resp.Members = append(resp.Members, MemberSearchResponse{
			ID:          m.ID,
			Username:    m.Username,
			DisplayName: m.DisplayName,
			ImageURL:    imageURL,
			ClubCount:   m.ClubCount,
		})
	}

	for _, s := range spaces {
		city := ""
		if s.City != nil {
			city = *s.City
		}
		country := ""
		if s.Country != nil {
			country = *s.Country
		}
		resp.Spaces = append(resp.Spaces, SpaceSearchResponse{
			ID:        s.ID,
			Name:      s.Name,
			Slug:      s.Slug,
			City:      city,
			Country:   country,
			ClubCount: s.ClubCount,
		})
	}

	response.OK(c, resp)
}