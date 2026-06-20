package club

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"
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

func (r *clubRepository) DeleteClub(ctx context.Context, ownerID string) error {
	query := `
		UPDATE public.club
		SET is_deleted = true, updated_at = $1
		WHERE owner_id = $2
		  AND is_deleted = false`

	_, err := r.db.ExecContext(ctx, query, time.Now(), ownerID)
	return err
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
			activate, is_deleted, created_at, updated_at
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,false,NOW(),NOW())
		RETURNING id, owner_id, name, description, club_type, visibility, max_seats, created_at, updated_at`

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
	).Scan(
		&club.ID,
		&club.OwnerID,
		&club.Name,
		&club.Description,
		&club.ClubType,
		&club.Visibility,
		&club.MaxSeats,
		&club.CreatedAt,
		&club.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("insert club: %w", err)
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