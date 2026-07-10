package profile

import (
	"club-backend/internal/file"
	"context"
	"database/sql"

	"fmt"
)

type profileRepository struct {
	db        *sql.DB
	uploadSvc *file.UploadService
}

func NewProfileRepository(db *sql.DB, uploadSvc *file.UploadService) ProfileRepository {
	return &profileRepository{db: db, uploadSvc: uploadSvc}
}

// ── GET /user ─────────────────────────────────────────────────────────────────

func (r *profileRepository) GetUserInfo(ctx context.Context, ownerID string) (*UserEntity, error) {
	query := `
		SELECT
			id,
			email,
			username,
			display_name,
			bio,
			image_url,
			banner_url,
			social_links,
			created_at
		FROM public.users
		WHERE id = $1
		  AND deleted_at IS NULL`

	var u UserEntity
	err := r.db.QueryRowContext(ctx, query, ownerID).Scan(
		&u.ID,
		&u.Email,
		&u.Username,
		&u.DisplayName,
		&u.Bio,
		&u.ImageURL,
		&u.BannerURL,
		&u.SocialLinks,
		&u.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// ── PATCH /user ───────────────────────────────────────────────────────────────
func (r *profileRepository) GetUserImageURLs(ctx context.Context, ownerID string) (*UserImageURLs, error) {
	var urls UserImageURLs
	err := r.db.QueryRowContext(ctx,
		`SELECT image_url,banner_url  FROM public.users WHERE id = $1 AND deleted_at IS NULL`,
		ownerID,
	).Scan(&urls.ImageURL,&urls.BannerURL)
	if err != nil {
		return nil, err
	}
	return &urls, nil
}

func (r *profileRepository) PatchUser(ctx context.Context, ownerID string, req PatchUserRequest) error {
	setClauses := []string{}
	args := []any{}
	idx := 1

	if req.DisplayName != nil {
		setClauses = append(setClauses, fmt.Sprintf("display_name = $%d", idx))
		args = append(args, *req.DisplayName)
		idx++
	}
	if req.Bio != nil {
		setClauses = append(setClauses, fmt.Sprintf("bio = $%d", idx))
		args = append(args, *req.Bio)
		idx++
	}
	if req.ImageURL != nil {
		setClauses = append(setClauses, fmt.Sprintf("image_url = $%d", idx))
		args = append(args, *req.ImageURL)
		idx++
	}
	if req.BannerURL != nil {
		setClauses = append(setClauses, fmt.Sprintf("banner_url = $%d", idx))
		args = append(args, *req.BannerURL)
		idx++
	}
	if req.SocialLinks != nil {
		setClauses = append(setClauses, fmt.Sprintf("social_links = $%d", idx))
		args = append(args, req.SocialLinks)
		idx++
	}

	if len(setClauses) == 0 {
		return nil 
	}

	setClauses = append(setClauses, "updated_at = NOW()")
	query := fmt.Sprintf(
		`UPDATE public.users SET %s WHERE id = $%d AND deleted_at IS NULL`,
		joinClauses(setClauses), idx,
	)
	args = append(args, ownerID)

	_, err := r.db.ExecContext(ctx, query, args...)
	return err
}

// ── GET /user/club ────────────────────────────────────────────────────────────
func (r *profileRepository) GetUserClubs(ctx context.Context, ownerID string) ([]UserClubEntity, error) {
	query := `
		SELECT
			c.id,
			c.name,
			c.image_url,
			cmr.name AS role_name,
			cm.joined_at,
			cc.name,
			COUNT(m.user_id) AS active_member_count
		FROM public.club_member cm
		JOIN public.club c
			ON c.id = cm.club_id
		JOIN public.club_member_roles cmr
			ON cmr.id = cm.role_id
		JOIN public.category cc
			ON cc.id = c.category_id
		LEFT JOIN public.club_member m
			ON m.club_id = c.id
			AND m.status = 'Active'
		WHERE cm.user_id = $1
			AND c.is_deleted = false
		GROUP BY
			c.id,
			c.name,
			c.image_url,
			cmr.name,
			cm.joined_at,
			cc.name
		ORDER BY cm.joined_at DESC`

	rows, err := r.db.QueryContext(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clubs []UserClubEntity
	for rows.Next() {
		var e UserClubEntity
		if err := rows.Scan(
			&e.ClubID,
			&e.ClubName,
			&e.ClubImage,
			&e.RoleName,
			&e.JoinedAt,
			&e.Category,
			&e.ActiveMemberCount,
		); err != nil {
			return nil, err
		}
		clubs = append(clubs, e)
	}
	return clubs, rows.Err()
}

// ── DELETE /user ──────────────────────────────────────────────────────────────
func (r *profileRepository) GetUserAssetURLs(ctx context.Context, ownerID string) (*UserAssets, error) {
	assets := &UserAssets{}

	// 1. User's own profile image.
	if err := r.db.QueryRowContext(ctx,
		`SELECT image_url FROM public.users WHERE id = $1 AND deleted_at IS NULL`,
		ownerID,
	).Scan(&assets.UserImageURL); err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("get user image url: %w", err)
	}

	// 1.2 User's own profile banner.
	if err := r.db.QueryRowContext(ctx,
		`SELECT banner_url FROM public.users WHERE id = $1 AND deleted_at IS NULL`,
		ownerID,
	).Scan(&assets.UserBannerURL); err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("get user banner url: %w", err)
	}

	// 2. Thumbnail images of every club the user owns.
	clubImageRows, err := r.db.QueryContext(ctx,
		`SELECT COALESCE(image_url, '') FROM public.club WHERE owner_id = $1 AND is_deleted = false`,
		ownerID,
	)
	if err != nil {
		return nil, fmt.Errorf("get club image urls: %w", err)
	}
	defer clubImageRows.Close()
	for clubImageRows.Next() {
		var u string
		if err := clubImageRows.Scan(&u); err != nil {
			return nil, fmt.Errorf("scan club image url: %w", err)
		}
		assets.ClubImageURLs = append(assets.ClubImageURLs, u)
	}
	if err := clubImageRows.Err(); err != nil {
		return nil, err
	}

	galleryRows, err := r.db.QueryContext(ctx,
		`SELECT unnest(gallery_urls) FROM public.club WHERE owner_id = $1 AND is_deleted = false`,
		ownerID,
	)
	if err != nil {
		return nil, fmt.Errorf("get club gallery urls: %w", err)
	}
	defer galleryRows.Close()
	for galleryRows.Next() {
		var u string
		if err := galleryRows.Scan(&u); err != nil {
			return nil, fmt.Errorf("scan gallery url: %w", err)
		}
		assets.ClubGalleryURLs = append(assets.ClubGalleryURLs, u)
	}
	if err := galleryRows.Err(); err != nil {
		return nil, err
	}

	return assets, nil
}

func (r *profileRepository) DeleteUser(ctx context.Context, ownerID string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	// Step 1 – delete clubs owned by the user.
	if _, err := tx.ExecContext(ctx,
		`DELETE FROM public.club WHERE owner_id = $1`,
		ownerID,
	); err != nil {
		return fmt.Errorf("delete owned clubs: %w", err)
	}

	// Step 2 – hard-delete the user row.
	result, err := tx.ExecContext(ctx,
		`DELETE FROM public.users WHERE id = $1`,
		ownerID,
	)
	if err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("user not found")
	}

	return tx.Commit()
}
