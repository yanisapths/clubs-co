package club

import (
	"club-backend/internal/utils"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
)

type clubRepository struct {
	db *sql.DB
}

func NewClubRepository(db *sql.DB) ClubRepository {
	return &clubRepository{db: db}
}

func (r *clubRepository) GetListClubByOwnerID(ctx context.Context, ownerID string) ([]Club, error) {
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
			COALESCE(ARRAY_TO_JSON(c.tag_ids)::text,  '[]') AS tag_ids,
			c.created_at,
			c.updated_at,
			u.username as owner,
			c.owner_id,
			COALESCE(cg.name, '') AS category_name,
			COALESCE(
				JSON_AGG(
					JSON_BUILD_OBJECT('id', t.id, 'name', t.name)
				) FILTER (WHERE t.id IS NOT NULL),
				'[]'
			) AS tags
		FROM public.club c
		LEFT JOIN public.category cg ON cg.id = c.category_id
		LEFT JOIN public.tag t ON t.id = ANY(c.tag_ids)
		LEFT JOIN public.users u ON u.id = c.owner_id
		WHERE c.owner_id = $1
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
			cg.name,
		    u.username 
		ORDER BY c.created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clubs []Club
	for rows.Next() {
		var club Club
		var (
			socialLinksRaw []byte
			spaceIDsRaw    []byte
			tagIDsRaw      []byte
			tagsRaw        []byte
		)

		if err := rows.Scan(
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
			&club.CategoryName,
			&tagsRaw,
		); err != nil {
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

		clubs = append(clubs, club)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return clubs, nil
}

func (r *clubRepository) DeleteClub(ctx context.Context, ownerID string, clubID int64) error {
	query := `
		DELETE FROM public.club
		WHERE id       = $1
		  AND owner_id = $2`

	result, err := r.db.ExecContext(ctx, query, clubID, ownerID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("club not found or not owned by user")
	}

	return nil
}

func (r *clubRepository) CreateClub(ctx context.Context, ownerID string, req CreateClubRequest) (*Club, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	tagIDs, err := resolveTagIDs(ctx, tx, ownerID, req.Tags)
	if err != nil {
		return nil, fmt.Errorf("resolve tags: %w", err)
	}

	spaceIDs, err := resolveSpaceIDs(ctx, tx, ownerID, req.Spaces)
	if err != nil {
		return nil, fmt.Errorf("resolve spaces: %w", err)
	}

	query := `
		INSERT INTO public.club (
			owner_id, name, description, club_type, visibility,
			max_seats, category_id, tag_ids, space_ids,
			activate, is_deleted, created_at, updated_at,
			display_status
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,false,NOW(),NOW(),$10)
		RETURNING id, owner_id, name, description, club_type, visibility, max_seats, created_at, updated_at, display_status`

	var club Club
	err = tx.QueryRowContext(ctx, query,
		ownerID,
		req.Name,
		req.Description,
		req.ClubType,
		req.Visibility,
		req.MaxSeats,
		req.CategoryID,
		int64SliceToArray(tagIDs),
		int64SliceToArray(spaceIDs),
		req.DisplayStatus,
	).Scan(
		&club.ID,
	)
	if err != nil {
		return nil, fmt.Errorf("insert club: %w", err)
	}

	const addFounderQuery = `
		INSERT INTO public.club_member (club_id, user_id, role_id, joined_at)
		SELECT $1, $2, id, NOW()
		FROM   public.club_member_roles
		WHERE  rank = 1
		LIMIT  1`

	if _, err = tx.ExecContext(ctx, addFounderQuery, club.ID, ownerID); err != nil {
		return nil, fmt.Errorf("add founder member: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return &club, nil
}
func resolveTagIDs(ctx context.Context, tx *sql.Tx, createdBy string, inputs []TagInput) ([]int64, error) {
	var ids []int64
	for _, t := range inputs {
		if t.ID != nil {
			ids = append(ids, *t.ID)
			continue
		}
		if t.Name == nil {
			continue
		}
		slug := toSlug(*t.Name)
		var id int64
		err := tx.QueryRowContext(ctx, `
			INSERT INTO public.tag (name, slug, created_by, created_at)
			VALUES ($1, $2, $3, NOW())
			ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
			RETURNING id`,
			*t.Name, slug, createdBy,
		).Scan(&id)
		if err != nil {
			return nil, fmt.Errorf("upsert tag %q: %w", *t.Name, err)
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func resolveSpaceIDs(ctx context.Context, tx *sql.Tx, createdBy string, inputs []SpaceInput) ([]int64, error) {
	var ids []int64
	for _, s := range inputs {
		if s.ID != nil {
			ids = append(ids, *s.ID)
			continue
		}
		
		if s.Name == nil {
			continue
		}
		slug := toSlug(*s.Name)
		country := ""
		city := ""
		if s.Country != nil {
			country = *s.Country
		}
		if s.City != nil {
			city = *s.City
		}
		var id int64
		err := tx.QueryRowContext(ctx, `
			INSERT INTO public.space (name, slug, country, city, created_by, created_at)
			VALUES ($1, $2, $3, $4, $5, NOW())
			ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
			RETURNING id`,
			*s.Name, slug, country, city, createdBy,
		).Scan(&id)
		if err != nil {
			return nil, fmt.Errorf("upsert space %q: %w", *s.Name, err)
		}
		ids = append(ids, id)
	}
	return ids, nil
}

func toSlug(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = strings.ReplaceAll(slug, " ", "-")
	return slug
}

func int64SliceToArray(ids []int64) string {
	if len(ids) == 0 {
		return "{}"
	}
	result := "{"
	for i, id := range ids {
		if i > 0 {
			result += ","
		}
		result += fmt.Sprintf("%d", id)
	}
	return result + "}"
}

func (r *clubRepository) UpdateClub(ctx context.Context, ownerID string, clubID int64, req UpdateClubRequest) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	tagIDs, err := resolveTagIDs(ctx, tx, ownerID, req.Tags)
	if err != nil {
		return fmt.Errorf("resolve tags: %w", err)
	}

	spaceIDs, err := resolveSpaceIDs(ctx, tx, ownerID, req.Spaces)
	if err != nil {
		return fmt.Errorf("resolve spaces: %w", err)
	}

	query := `
		UPDATE public.club SET
			name           = COALESCE($1, name),
			description    = COALESCE($2, description),
			club_type      = COALESCE($3, club_type),
			visibility     = COALESCE($4, visibility),
			max_seats      = COALESCE($5, max_seats),
			category_id    = COALESCE($6, category_id),
			display_status = COALESCE($7, display_status),
			tag_ids        = $8,
			space_ids      = $9,
			updated_at     = NOW()
		WHERE id       = $10
		  AND owner_id = $11`

	result, err := tx.ExecContext(ctx, query,
		req.Name,
		req.Description,
		req.ClubType,
		req.Visibility,
		req.MaxSeats,
		req.CategoryID,
		req.DisplayStatus,
		int64SliceToArray(tagIDs),
		int64SliceToArray(spaceIDs),
		clubID,
		ownerID,
	)
	if err != nil {
		return fmt.Errorf("update club: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("club not found or not owned by user")
	}

	return tx.Commit()
}

func (r *clubRepository) InviteClubMember(ctx context.Context, inviterID string, clubID int64, req InviteClubMemberRequest) error {
	var ownerID string
	err := r.db.QueryRowContext(ctx,
		`SELECT owner_id FROM public.club WHERE id = $1 AND is_deleted = false`,
		clubID,
	).Scan(&ownerID)
	if err == sql.ErrNoRows {
		return ErrClubNotFound
	}
	if err != nil {
		return err
	}
	if ownerID != inviterID {
		return ErrNotClubOwner
	}

	var rank int
	err = r.db.QueryRowContext(ctx,
		`SELECT rank FROM public.club_member_roles WHERE id = $1`,
		req.RoleID,
	).Scan(&rank)
	if err == sql.ErrNoRows || rank == 1 {
		return ErrInvalidInviteRole
	}
	if err != nil {
		return err
	}

	var exists bool
	err = r.db.QueryRowContext(ctx,
		`SELECT EXISTS(
			SELECT 1 FROM public.club_member
			WHERE club_id = $1 AND user_id = $2
		)`,
		clubID, req.RecipientID,
	).Scan(&exists)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyMember
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO public.club_member_invite
			(inviter_id, recipient_id, club_id, recipient_role_id, created_at)
		VALUES ($1, $2, $3, $4, NOW())`,
		inviterID, req.RecipientID, clubID, req.RoleID,
	)
	if err != nil {
		if utils.IsUniqueViolation(err) {
			return ErrInviteAlreadyPending
		}
		return err
	}

	return nil
}


func (r *clubRepository) GetClubByID(ctx context.Context, clubID int64) (*Club, error) {
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
			COALESCE(cg.name, '') AS category_name,
			COALESCE(
				JSON_AGG(
					JSON_BUILD_OBJECT(
						'id', t.id,
						'name', t.name
					)
				) FILTER (WHERE t.id IS NOT NULL),
				'[]'
			) AS tags
		FROM public.club c
		LEFT JOIN public.category cg ON cg.id = c.category_id
		LEFT JOIN public.tag t ON t.id = ANY(c.tag_ids)
		LEFT JOIN public.users u ON u.id = c.owner_id
		WHERE c.id = $1
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
			cg.name,
			u.username
	`

	var club Club

	var (
		socialLinksRaw []byte
		spaceIDsRaw    []byte
		tagIDsRaw      []byte
		tagsRaw        []byte
	)

	err := r.db.QueryRowContext(ctx, query, clubID).Scan(
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
		&club.CategoryName,
		&tagsRaw,
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

	return &club, nil
}

func (r *clubRepository) GetClubMemberByClubID(
	ctx context.Context,
	clubID int64,
) ([]ClubMember, error) {

	query := `
		SELECT
			u.username,
			u.first_name,
			u.last_name,
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
			&member.MemberFirstame,
			&member.MemberLastname,
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