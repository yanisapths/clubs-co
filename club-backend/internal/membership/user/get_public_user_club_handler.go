// club-backend/internal/membership/user/get_public_user_club_handler.go

package user

import (
	"database/sql"
	"errors"

	"club-backend/pkg/response"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type getPublicUserClubHandler struct {
	repo   GetPublicUserClubRepo
	logger *zap.Logger
}

func NewGetPublicUserClub(repo GetPublicUserClubRepo, logger *zap.Logger) *getPublicUserClubHandler {
	return &getPublicUserClubHandler{repo: repo, logger: logger}
}

func (h *getPublicUserClubHandler) Handler(c *gin.Context) {
	username := c.Param("username")
	if username == "" {
		response.BadRequest(c, "invalid username")
		return
	}

	stats, err := h.repo.GetPublicUserClubStats(c.Request.Context(), username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			response.NotFound(c, "member not found")
			return
		}

		h.logger.Error(
			"failed : GetPublicUserClubStats",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, "failed to get club stats")
		return
	}

	clubs, err := h.repo.GetPublicUserClubList(c.Request.Context(), username)
	if err != nil {
		h.logger.Error(
			"failed : GetPublicUserClubList",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, "failed to get clubs")
		return
	}

	respClubs := make([]PublicUserClubItem, 0, len(clubs))
	for _, cl := range clubs {
		imageURL := ""
		if cl.ImageURL != nil {
			imageURL = *cl.ImageURL
		}

		respClubs = append(respClubs, PublicUserClubItem{
			ID:          cl.ID,
			Name:        cl.Name,
			ImageURL:    imageURL,
			Category:    cl.CategoryName,
			Role:        cl.Role,
			MemberSince: cl.JoinedAt.Unix(),
		})
	}

	resp := PublicUserClubResponse{
		Stats: UserClubStatsResponse{
			ClubFounded:    stats.ClubFounded,
			ClubJoined:     stats.ClubJoined,
			ClubMembership: stats.ClubMembership,
		},
		Clubs: respClubs,
	}

	response.OK(c, resp)
}