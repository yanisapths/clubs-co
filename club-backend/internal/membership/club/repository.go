package club

import (
	"club-backend/internal/utils"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)


type membershipRepository struct {
	db *sql.DB
}


func NewMembershipRepository(db *sql.DB) MembershipClubRepository {
	return &membershipRepository{db: db}
}

func (r *membershipRepository) GetClubList(ctx context.Context, userID *string) ([]Club, error) {
	query := `
		SELECT
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.club_type,
			c.visibility,
			c.max_seats,
			c.allow_followers,
			c.created_at,
			COALESCE(cg.name, '') AS category_name,
			COUNT(cm.user_id) AS member_count,
			CASE
				WHEN $1::uuid IS NULL THEN false
				ELSE EXISTS (
					SELECT 1
					FROM public.club_member me
					WHERE me.club_id = c.id
					AND me.user_id = $1::uuid
				)
			END AS is_member,
			COALESCE(ARRAY_TO_JSON(c.space_ids)::text, '[]') AS space_ids,
			COALESCE(ARRAY_TO_JSON(c.tag_ids)::text,  '[]') AS tag_ids,
			(
				SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'name', t.name)), '[]')
				FROM public.tag t
				WHERE t.id = ANY(c.tag_ids)
			) AS tags,
			(
				SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', s.id, 'name', s.name)), '[]')
				FROM public.space s
				WHERE s.id = ANY(c.space_ids)
			) AS spaces
		FROM public.club c
		LEFT JOIN public.category cg
			ON cg.id = c.category_id
		LEFT JOIN public.club_member cm
			ON cm.club_id = c.id
		WHERE c.is_deleted = false
		  AND c.display_status = TRUE
		GROUP BY c.id, cg.name
		ORDER BY c.created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clubs []Club
	for rows.Next() {
		var cl Club
		var (
			spaceIDsRaw    []byte
			spacesRaw      []byte
			tagIDsRaw      []byte
			tagsRaw        []byte
		)

		if err := rows.Scan(
			&cl.ID,
			&cl.Name,
			&cl.Description,
			&cl.ImageURL,
			&cl.ClubType,
			&cl.Visibility,
			&cl.MaxSeats,
			&cl.AllowFollowers,
			&cl.CreatedAt,
			&cl.CategoryName,
			&cl.MemberCount,
			&cl.IsMember,
			&spaceIDsRaw,
			&tagIDsRaw,
			&tagsRaw,
			&spacesRaw,
		); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(spacesRaw, &cl.Spaces); err != nil {
			return nil, fmt.Errorf("unmarshal space_ids: %w", err)
		}
		if err := json.Unmarshal(tagsRaw, &cl.Tags); err != nil {
			return nil, fmt.Errorf("unmarshal tags: %w", err)
		}
		clubs = append(clubs, cl)
	}

	return clubs, rows.Err()
}

// JoinClub adds a user as a member. Only valid for public clubs.
func (r *membershipRepository) JoinClub(ctx context.Context, userID string, clubID int64) error {
	var clubType string
	var currentCount, maxSeats int
	err := r.db.QueryRowContext(ctx, `
		SELECT c.club_type, c.max_seats, COUNT(cm.user_id)
		FROM public.club c
		LEFT JOIN public.club_member cm ON cm.club_id = c.id
		WHERE c.id = $1 AND c.is_deleted = false AND c.activate = true
		GROUP BY c.club_type, c.max_seats`,
		clubID,
	).Scan(&clubType, &maxSeats, &currentCount)
	if err == sql.ErrNoRows {
		return ErrClubNotFound
	}
	if err != nil {
		return err
	}
	if clubType != "Public" {
		return ErrClubNotPublic
	}
	if currentCount >= maxSeats {
		return ErrClubFull
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO public.club_member (club_id, user_id, role_id, joined_at)
		SELECT $1, $2, id, NOW()
		FROM   public.club_member_roles
		WHERE  rank = 3
		LIMIT  1`,
		clubID, userID,
	)
	if err != nil {
		if utils.IsUniqueViolation(err) {
			return ErrAlreadyMember
		}
		return err
	}
	return nil
}

func (r *membershipRepository) LeaveClub(ctx context.Context, userID string, clubID int64) error {
	var rank int
	err := r.db.QueryRowContext(ctx, `
		SELECT cmr.rank
		FROM   public.club_member     cm
		JOIN   public.club_member_roles cmr ON cmr.id = cm.role_id
		WHERE  cm.club_id = $1 AND cm.user_id = $2`,
		clubID, userID,
	).Scan(&rank)
	if err == sql.ErrNoRows {
		return ErrNotMember
	}
	if err != nil {
		return err
	}
	if rank == 1 {
		return ErrFounderCannotLeave
	}

	_, err = r.db.ExecContext(ctx,
		`DELETE FROM public.club_member WHERE club_id = $1 AND user_id = $2`,
		clubID, userID,
	)
	return err
}


func (r *membershipRepository) GetClubByID(ctx context.Context, userID *string, clubID int64) (*Club, error) {
	query := `
		SELECT
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.club_type,
			c.visibility,
			c.max_seats,
			c.allow_followers,
			c.activate,
			c.social_links,
			COALESCE(ARRAY_TO_JSON(c.space_ids)::text, '[]') AS space_ids,
			COALESCE(ARRAY_TO_JSON(c.tag_ids)::text, '[]') AS tag_ids,
			c.created_at,
			c.updated_at,
			u.username AS owner,
			c.owner_id,
			cg.id AS category_id,
			COALESCE(cg.name, '') AS category_name,
			COALESCE(
				JSON_AGG(
					JSON_BUILD_OBJECT(
						'id', t.id,
						'name', t.name
					)
				) FILTER (WHERE t.id IS NOT NULL),
				'[]'
			) AS tags,
			COUNT(cm.user_id) AS member_count,
			CASE
				WHEN $1::uuid IS NULL THEN false
				ELSE EXISTS (
					SELECT 1
					FROM public.club_member me
					WHERE me.club_id = c.id
					AND me.user_id = $1::uuid
				)
			END AS is_member,
			COALESCE(ARRAY_TO_JSON(c.gallery_urls)::text, '[]') AS gallery_urls,
			u.display_name
		FROM public.club c
		LEFT JOIN public.category cg ON cg.id = c.category_id
		LEFT JOIN public.tag t ON t.id = ANY(c.tag_ids)
		LEFT JOIN public.users u ON u.id = c.owner_id
		LEFT JOIN public.club_member cm
			ON cm.club_id = c.id
		WHERE c.id = $2
		  AND c.is_deleted = false
		GROUP BY
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.club_type,
			c.visibility,
			c.max_seats,
			c.allow_followers,
			c.activate,
			c.social_links,
			c.space_ids,
			c.tag_ids,
			c.created_at,
			c.updated_at,
			c.owner_id,
			cg.id,
			cg.name,
			u.username,
			u.display_name
	`

	var club Club

	var (
		socialLinksRaw []byte
		spaceIDsRaw    []byte
		tagIDsRaw      []byte
		tagsRaw        []byte
		galleryRaw     []byte
	)

	err := r.db.QueryRowContext(ctx, query, userID,clubID).Scan(
		&club.ID,
		&club.Name,
		&club.Description,
		&club.ImageURL,
		&club.ClubType,
		&club.Visibility,
		&club.MaxSeats,
		&club.AllowFollowers,
		&club.Activate,
		&socialLinksRaw,
		&spaceIDsRaw,
		&tagIDsRaw,
		&club.CreatedAt,
		&club.UpdatedAt,
		&club.Owner,
		&club.OwnerID,
		&club.CategoryID,
		&club.CategoryName,
		&tagsRaw,
		&club.MemberCount,
		&club.IsMember,
		&galleryRaw,
		&club.OwnerDisplayName,
	)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(socialLinksRaw, &club.SocialLinks); err != nil {
		return nil, fmt.Errorf("unmarshal social_links: %w", err)
	}

	if err := json.Unmarshal(spaceIDsRaw, &club.SpaceIDs); err != nil {
		return nil, fmt.Errorf("unmarshal space_ids: %w", err)
	}

	if err := json.Unmarshal(tagsRaw, &club.Tags); err != nil {
		return nil, fmt.Errorf("unmarshal tags: %w", err)
	}
	
	if err := json.Unmarshal(galleryRaw, &club.GalleryURLs); err != nil {
		return nil, fmt.Errorf("unmarshal gallery_urls: %w", err)
	}

	return &club, nil
}

func (r *membershipRepository) GetClubMemberByClubID(
	ctx context.Context,
	clubID int64,
) ([]ClubMember, error) {

	query := `
		SELECT
			u.username,
			u.display_name,
			u.id,
			r.name AS role,
			cm.joined_at
		FROM public.club_member cm
		INNER JOIN public.users u
			ON u.id = cm.user_id
		INNER JOIN public.club_member_roles r
			ON r.id = cm.role_id
		WHERE cm.club_id = $1
		ORDER BY cm.joined_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, clubID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []ClubMember

	for rows.Next() {
		var member ClubMember

		if err := rows.Scan(
			&member.MemberUsername,
			&member.MemberDisplayName,
			&member.MemberID,
			&member.Role,
			&member.JoinedAt,
		); err != nil {
			return nil, err
		}

		members = append(members, member)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return members, nil
}

func (r *membershipRepository) GetClubByName(ctx context.Context, userID *string, clubSlug string) (*Club, error) {
	query := `
		SELECT
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.club_type,
			c.visibility,
			c.max_seats,
			c.allow_followers,
			c.activate,
			c.social_links,
			COALESCE(ARRAY_TO_JSON(c.space_ids)::text, '[]') AS space_ids,
			COALESCE(ARRAY_TO_JSON(c.tag_ids)::text, '[]') AS tag_ids,
			c.created_at,
			c.updated_at,
			u.username AS owner,
			c.owner_id,
			cg.id AS category_id,
			COALESCE(cg.name, '') AS category_name,
			COALESCE(
				JSON_AGG(
					JSON_BUILD_OBJECT(
						'id', t.id,
						'name', t.name
					)
				) FILTER (WHERE t.id IS NOT NULL),
				'[]'
			) AS tags,
			COUNT(cm.user_id) AS member_count,
			CASE
				WHEN $1::uuid IS NULL THEN false
				ELSE EXISTS (
					SELECT 1
					FROM public.club_member me
					WHERE me.club_id = c.id
					AND me.user_id = $1::uuid
				)
			END AS is_member,
			COALESCE(ARRAY_TO_JSON(c.gallery_urls)::text, '[]') AS gallery_urls,
			u.display_name
		FROM public.club c
		LEFT JOIN public.category cg ON cg.id = c.category_id
		LEFT JOIN public.tag t ON t.id = ANY(c.tag_ids)
		LEFT JOIN public.users u ON u.id = c.owner_id
		LEFT JOIN public.club_member cm
			ON cm.club_id = c.id
		WHERE LOWER(REGEXP_REPLACE(TRIM(c.name), '\s+', '-', 'g')) = LOWER($2)
		  AND c.is_deleted = false
		GROUP BY
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.club_type,
			c.visibility,
			c.max_seats,
			c.allow_followers,
			c.activate,
			c.social_links,
			c.space_ids,
			c.tag_ids,
			c.created_at,
			c.updated_at,
			c.owner_id,
			cg.id,
			cg.name,
			u.username,
			u.display_name
	`

	var club Club

	var (
		socialLinksRaw []byte
		spaceIDsRaw    []byte
		tagIDsRaw      []byte
		tagsRaw        []byte
		galleryRaw     []byte
	)

	err := r.db.QueryRowContext(ctx, query, userID, clubSlug).Scan(
		&club.ID,
		&club.Name,
		&club.Description,
		&club.ImageURL,
		&club.ClubType,
		&club.Visibility,
		&club.MaxSeats,
		&club.AllowFollowers,
		&club.Activate,
		&socialLinksRaw,
		&spaceIDsRaw,
		&tagIDsRaw,
		&club.CreatedAt,
		&club.UpdatedAt,
		&club.Owner,
		&club.OwnerID,
		&club.CategoryID,
		&club.CategoryName,
		&tagsRaw,
		&club.MemberCount,
		&club.IsMember,
		&galleryRaw,
		&club.OwnerDisplayName,
	)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(socialLinksRaw, &club.SocialLinks); err != nil {
		return nil, fmt.Errorf("unmarshal social_links: %w", err)
	}
	if err := json.Unmarshal(spaceIDsRaw, &club.SpaceIDs); err != nil {
		return nil, fmt.Errorf("unmarshal space_ids: %w", err)
	}
	if err := json.Unmarshal(tagsRaw, &club.Tags); err != nil {
		return nil, fmt.Errorf("unmarshal tags: %w", err)
	}
	if err := json.Unmarshal(galleryRaw, &club.GalleryURLs); err != nil {
		return nil, fmt.Errorf("unmarshal gallery_urls: %w", err)
	}

	return &club, nil
}