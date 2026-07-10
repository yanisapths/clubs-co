package user

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

type membershipUserRepository struct {
	db *sql.DB
}

func NewMembershipUserRepository(db *sql.DB) UserRepository {
	return &membershipUserRepository{
		db: db,
	}
}

func (r *membershipUserRepository) GetExistUser(
	ctx context.Context,
	email *string,
	username *string,
) (bool, error) {

	var exist bool

	query := `
	SELECT EXISTS (
		SELECT 1
		FROM public.users
		WHERE
			($1::text IS NOT NULL AND email = $1)
			OR
			($2::text IS NOT NULL AND username = $2)
			)
		`

	err := r.db.QueryRowContext(
		ctx,
		query,
		email,
		username,
	).Scan(&exist)

	if err != nil {
		return false, err
	}

	return exist, nil
}

// GetPublicProfileByUsername returns the public-facing profile fields for a
// user by username. Returns sql.ErrNoRows if no such user exists.
//
// NOTE: assumes public.users carries display_name, bio, image_url,
// banner_url, social_links (jsonb) and created_at directly. Point this at
// whatever table/join the internal/profile package actually reads from if
// that data lives elsewhere (e.g. a separate profiles table).
func (r *membershipUserRepository) GetPublicProfileByUsername(
	ctx context.Context,
	username string,
) (*PublicProfile, error) {
	query := `
		SELECT
			u.id,
			u.username,
			u.display_name,
			u.bio,
			u.image_url,
			u.banner_url,
			COALESCE(u.social_links::text, '[]') AS social_links,
			u.created_at
		FROM public.users u
		WHERE u.username = $1
	`

	var profile PublicProfile
	var socialLinksRaw []byte

	err := r.db.QueryRowContext(ctx, query, username).Scan(
		&profile.ID,
		&profile.Username,
		&profile.DisplayName,
		&profile.Bio,
		&profile.ImageURL,
		&profile.BannerURL,
		&socialLinksRaw,
		&profile.JoinedAt,
	)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(socialLinksRaw, &profile.SocialLinks); err != nil {
		return nil, fmt.Errorf("unmarshal social_links: %w", err)
	}

	return &profile, nil
}

func (r *membershipUserRepository) GetPublicUserClubStats(
	ctx context.Context,
	username string,
) (*UserClubStats, error) {
	query := `
		SELECT
			COALESCE(agg.club_founded, 0),
			COALESCE(agg.club_joined, 0)
		FROM public.users u
		LEFT JOIN LATERAL (
			SELECT
				COUNT(*) FILTER (WHERE cmr.rank = 1) AS club_founded,
				COUNT(*) AS club_joined
			FROM public.club_member cm
			JOIN public.club_member_roles cmr ON cmr.id = cm.role_id
			JOIN public.club c ON c.id = cm.club_id
			WHERE cm.user_id = u.id
			  AND c.is_deleted = false
		) agg ON true
		WHERE u.username = $1
	`

	var stats UserClubStats

	err := r.db.QueryRowContext(ctx, query, username).Scan(
		&stats.ClubFounded,
		&stats.ClubJoined,
	)
	if err != nil {
		return nil, err
	}

	return &stats, nil
}

// GetPublicUserClubList returns the (non-deleted) clubs a user belongs to,
// most recently joined first. Returns an empty slice (not an error) if the
// user has no clubs — existence of the user itself should already have been
// checked via GetPublicUserClubStats before calling this.
func (r *membershipUserRepository) GetPublicUserClubList(
	ctx context.Context,
	username string,
) ([]PublicUserClub, error) {
	query := `
		SELECT
			c.id,
			c.name,
			c.image_url,
			COALESCE(cg.name, '') AS category_name,
			cmr.name AS role,
			cm.joined_at
		FROM public.club_member cm
		JOIN public.users u ON u.id = cm.user_id
		JOIN public.club c ON c.id = cm.club_id AND c.is_deleted = false
		JOIN public.club_member_roles cmr ON cmr.id = cm.role_id
		LEFT JOIN public.category cg ON cg.id = c.category_id
		WHERE u.username = $1
		ORDER BY cm.joined_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clubs []PublicUserClub

	for rows.Next() {
		var cl PublicUserClub

		if err := rows.Scan(
			&cl.ID,
			&cl.Name,
			&cl.ImageURL,
			&cl.CategoryName,
			&cl.Role,
			&cl.JoinedAt,
		); err != nil {
			return nil, err
		}

		clubs = append(clubs, cl)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return clubs, nil
}