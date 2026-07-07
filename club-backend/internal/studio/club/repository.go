package club

import (
	"club-backend/internal/file"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/lib/pq"
)

type clubRepository struct {
	db *sql.DB
	uploadSvc *file.UploadService
}

func NewClubRepository(db *sql.DB,uploadSvc *file.UploadService) ClubRepository {
	return &clubRepository{db: db, uploadSvc: uploadSvc}
}

func (r *clubRepository) GetListClubByOwnerID(ctx context.Context, ownerID string) ([]Club, error) {
	query := `
		SELECT 
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.banner_url,
			COALESCE(ARRAY_TO_JSON(c.gallery_urls)::text, '[]') AS gallery_urls,
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
			cg.id AS category_id,
			COALESCE(cg.name, '') AS category_name,
			(
				SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'name', t.name)), '[]')
				FROM public.tag t
				WHERE t.id = ANY(c.tag_ids)
			) AS tags,
			(
				SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', s.id, 'name', s.name)), '[]')
				FROM public.space s
				WHERE s.id = ANY(c.space_ids)
			) AS spaces,
			COUNT(*) FILTER (WHERE cm.status = 'Active')  AS member_count,
			COUNT(*) FILTER (WHERE cm.status = 'Pending') AS pending_member_count,
			(
				SELECT COUNT(*)
				FROM public.club_member_invite cmi
				WHERE cmi.club_id = c.id
				AND cmi.invitation_response = false
				AND (cmi.expires_at IS NULL OR cmi.expires_at > NOW())
			) AS pending_invite_count
		FROM public.club c
		LEFT JOIN public.category cg ON cg.id = c.category_id
		LEFT JOIN public.users u ON u.id = c.owner_id
		LEFT JOIN public.club_member cm ON cm.club_id = c.id
		WHERE c.owner_id = $1
		AND c.is_deleted = false
		GROUP BY
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.banner_url,
			c.gallery_urls,
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
			cg.id,
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
			galleryRaw     []byte
			spaceIDsRaw    []byte
			spacesRaw      []byte
			tagIDsRaw      []byte
			tagsRaw        []byte
		)

		if err := rows.Scan(
			&club.ID,
			&club.Name,
			&club.Description,
			&club.ImageURL,
			&club.BannerURL,
			&galleryRaw,
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
			&spacesRaw,
			&club.MemberCount,
			&club.PendingMemberCount,
			&club.PendingInviteCount,
		); err != nil {
			return nil, err
		}

		if err := json.Unmarshal(socialLinksRaw, &club.SocialLinks); err != nil {
			return nil, fmt.Errorf("unmarshal social_links: %w", err)
		}
		if err := json.Unmarshal(galleryRaw, &club.GalleryURLs); err != nil {
			return nil, fmt.Errorf("unmarshal gallery_urls: %w", err)
		}
		if err := json.Unmarshal(spacesRaw, &club.Spaces); err != nil {
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

	var exists bool
	err = tx.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM public.club
			WHERE LOWER(REGEXP_REPLACE(TRIM(name), '\s+', '-', 'g'))
				= LOWER(REGEXP_REPLACE(TRIM($1), '\s+', '-', 'g'))
			AND is_deleted = false
		)`,
		req.Name,
	).Scan(&exists)

	tagIDs, err := resolveTagIDs(ctx, tx, ownerID, req.Tags)
	if err != nil {
		return nil, fmt.Errorf("resolve tags: %w", err)
	}

	spaceIDs, err := resolveSpaceIDs(ctx, tx, ownerID, req.Spaces)
	if err != nil {
		return nil, fmt.Errorf("resolve spaces: %w", err)
	}
	socialLinksJSON, err := marshalSocialLinks(req.SocialLinks)
	if err != nil {
		return nil, fmt.Errorf("marshal social_links: %w", err)
	}

	query := `
    INSERT INTO public.club (
        owner_id, name, description, club_type, visibility,
        max_seats, category_id, tag_ids, space_ids,
        image_url,
        activate, is_deleted, created_at, updated_at,
        display_status, social_links
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,false,NOW(),NOW(),$11,$12)
    RETURNING id`
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
		req.ThumbnailImage,
		req.Activate,
		socialLinksJSON,   
	).Scan(&club.ID)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrClubNameTaken
		}
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
	var exists bool
	err = tx.QueryRowContext(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM public.club
			WHERE name = $1
		)`,
		req.Name,
	).Scan(&exists)
	if err != nil {
		return  fmt.Errorf("check club name exists: %w", err)
	}
	if exists {
		return ErrClubNameTaken
	}

	tagIDs, err := resolveTagIDs(ctx, tx, ownerID, req.Tags)
	if err != nil {
		return fmt.Errorf("resolve tags: %w", err)
	}

	spaceIDs, err := resolveSpaceIDs(ctx, tx, ownerID, req.Spaces)
	if err != nil {
		return fmt.Errorf("resolve spaces: %w", err)
	}
	socialLinksJSON, err := marshalSocialLinks(req.SocialLinks)
	if err != nil {
		return fmt.Errorf("marshal social_links: %w", err)
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
			image_url      = CASE
								WHEN $8::boolean THEN $9
								ELSE image_url
							END,
			tag_ids        = $10,
			space_ids      = $11,
			social_links   = COALESCE($12, social_links),
			updated_at     = NOW()
		WHERE id         = $13
		AND owner_id   = $14::uuid
		AND is_deleted = false`


	thumbnailChanged := req.ThumbnailImage.Present
	thumbnailValue := req.ThumbnailImage.Value
	
	result, err := tx.ExecContext(ctx, query,
		req.Name,       
		req.Description,   
		req.ClubType,    
		req.Visibility, 
		req.MaxSeats,   
		req.CategoryID,   
		req.DisplayStatus,
		thumbnailChanged,  
		thumbnailValue,  
		int64SliceToArray(tagIDs),   
		int64SliceToArray(spaceIDs),  
		socialLinksJSON,
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


func (r *clubRepository) GetClubByIDByOwnerId(ctx context.Context, clubID int64, ownerID string) (*Club, error) {
	query := `
		SELECT
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.banner_url,
			COALESCE(ARRAY_TO_JSON(c.gallery_urls)::text, '[]') AS gallery_urls,
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
			(
				SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'name', t.name)), '[]')
				FROM public.tag t
				WHERE t.id = ANY(c.tag_ids)
			) AS tags,
			(
				SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('id', s.id, 'name', s.name)), '[]')
				FROM public.space s
				WHERE s.id = ANY(c.space_ids)
			) AS spaces,
			u.display_name,
			COUNT(*) FILTER (WHERE cm.status = 'Active')  AS member_count,
			COUNT(*) FILTER (WHERE cm.status = 'Pending') AS pending_member_count,
			(
				SELECT COUNT(*)
				FROM public.club_member_invite cmi
				WHERE cmi.club_id = c.id
				AND cmi.invitation_response = false
				AND (cmi.expires_at IS NULL OR cmi.expires_at > NOW())
			) AS pending_invite_count
		FROM public.club c
		LEFT JOIN public.category cg ON cg.id = c.category_id
		LEFT JOIN public.users u ON u.id = c.owner_id
		LEFT JOIN public.club_member cm ON cm.club_id = c.id
		WHERE c.id = $1
			AND c.owner_id = $2
			AND c.is_deleted = false
		GROUP BY
			c.id,
			c.name,
			c.description,
			c.image_url,
			c.banner_url,
			c.gallery_urls,
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
			cg.id,
			u.username,
			u.display_name
	`

	var club Club

	var (
		socialLinksRaw []byte
		galleryRaw     []byte
		spaceIDsRaw    []byte
		spacesRaw      []byte
		tagIDsRaw      []byte
		tagsRaw        []byte
	)

	err := r.db.QueryRowContext(ctx, query, clubID, ownerID).Scan(
		&club.ID,
		&club.Name,
		&club.Description,
		&club.ImageURL,
		&club.BannerURL,
		&galleryRaw,
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
		&spacesRaw,
		&club.OwnerDisplayName,
		&club.MemberCount,
		&club.PendingMemberCount,
		&club.PendingInviteCount,
	)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(socialLinksRaw, &club.SocialLinks); err != nil {
		return nil, fmt.Errorf("unmarshal social_links: %w", err)
	}

	if err := json.Unmarshal(galleryRaw, &club.GalleryURLs); err != nil {
		return nil, fmt.Errorf("unmarshal gallery_urls: %w", err)
	}

	if err := json.Unmarshal(spacesRaw, &club.Spaces); err != nil {
		return nil, fmt.Errorf("unmarshal spaces: %w", err)
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
			u.display_name,
			u.id,
			r.name AS role,
			cm.joined_at AS joined_at,
			(cm.status = 'Pending') AS is_pending,
			false AS is_invited
		FROM public.club_member cm
		INNER JOIN public.users u
			ON u.id = cm.user_id
		INNER JOIN public.club_member_roles r
			ON r.id = cm.role_id
		WHERE cm.club_id = $1

		UNION ALL

		SELECT
			u.username,
			u.display_name,
			u.id,
			r.name AS role,
			cmi.created_at AS joined_at,
			(
				cmi.invitation_response = false
				AND (cmi.expires_at IS NULL OR cmi.expires_at > NOW())
			) AS is_pending,
			true AS is_invited
		FROM public.club_member_invite cmi
		INNER JOIN public.users u
			ON u.id = cmi.recipient_id
		INNER JOIN public.club_member_roles r
			ON r.id = cmi.recipient_role_id
		WHERE cmi.club_id = $1
			AND cmi.invitation_response = false
			AND (cmi.expires_at IS NULL OR cmi.expires_at > NOW())

		ORDER BY joined_at ASC
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
			&member.IsPending,
			&member.IsInvited,
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

func (r *clubRepository) GetClubImageURL(ctx context.Context, clubID int64, ownerID string) (*string, error) {
	var imageURL *string
	err := r.db.QueryRowContext(ctx,
		`SELECT image_url FROM public.club WHERE id = $1 AND owner_id = $2::uuid AND is_deleted = false`,
		clubID, ownerID,
	).Scan(&imageURL)
	if err != nil {
		return nil, fmt.Errorf("get club image url: %w", err)
	}
	return imageURL, nil
}

func (r *clubRepository) PatchClub(
	ctx context.Context,
	ownerID string,
	clubID int64,
	req PatchClubRequest,
) (*PatchClubResult, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() {
		_ = tx.Rollback()
	}()

	if req.Name != nil {
		var exists bool
		err = tx.QueryRowContext(ctx, `
			SELECT EXISTS (
				SELECT 1 FROM public.club
				WHERE id != $2
				  AND is_deleted = false
				  AND LOWER(REGEXP_REPLACE(TRIM(name), '\s+', '-', 'g'))
					= LOWER(REGEXP_REPLACE(TRIM($1), '\s+', '-', 'g'))
			)`,
			req.Name, clubID,
		).Scan(&exists)
		if err != nil {
			return nil, fmt.Errorf("check club name exists: %w", err)
		}
		if exists {
			return nil, ErrClubNameTaken
		}
	}

	tagIDs, err := resolveTagIDs(ctx, tx, ownerID, req.Tags)
	if err != nil {
		return nil, fmt.Errorf("resolve tags: %w", err)
	}
	if tagIDs == nil {
		tagIDs = []int64{}
	}
	
	spaceIDs, err := resolveSpaceIDs(ctx, tx, ownerID, req.Spaces)
	if err != nil {
		return nil, fmt.Errorf("resolve spaces: %w", err)
	}
	if spaceIDs == nil {
		spaceIDs = []int64{}
	}

	var (
		clubName       string
		currentGallery []string
	)
	err = tx.QueryRowContext(
		ctx,
		`SELECT
			name,
			COALESCE(gallery_urls, ARRAY[]::text[])
		FROM public.club
		WHERE id = $1
		  AND owner_id = $2::uuid
		  AND is_deleted = false
		FOR UPDATE`,
		clubID,
		ownerID,
	).Scan(
		&clubName,
		pq.Array(&currentGallery),
	)
	
	if err == sql.ErrNoRows {
		return nil, ErrClubNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("lock club for gallery update: %w", err)
	}

	removeSet := make(map[string]struct{}, len(req.GalleriesToRemove))
	for _, u := range req.GalleriesToRemove {
		removeSet[u] = struct{}{}
	}

	nextGallery := make([]string, 0, len(currentGallery)+len(req.GalleriesToAdd))
	for _, u := range currentGallery {
		if _, removed := removeSet[u]; !removed {
			nextGallery = append(nextGallery, u)
		}
	}

	var promoted []promotedGalleryImage
	var warnings []error  

	for _, tempURL := range req.GalleriesToAdd {
		ext := extFromURL(tempURL)
		filename := GalleryFilename(clubName, clubID, ext)

		result, moveErr := r.uploadSvc.MoveObject(ctx, tempURL, "club/gallery", filename)
		if moveErr != nil && result == nil {
			return nil, fmt.Errorf("promote gallery image %s: %w", tempURL, moveErr)
		}

		if moveErr != nil {
			promoted = append(promoted, promotedGalleryImage{
				URL:     result.URL,
				Warning: moveErr,
			})
			continue
		}

		promoted = append(promoted, promotedGalleryImage{
			URL: result.URL,
		})
	}

	if len(nextGallery)+len(promoted) > MaxGalleryImages {
		return nil, fmt.Errorf("%w: limit is %d", ErrTooManyGalleryImages, MaxGalleryImages)
	}

	for _, p := range promoted {
		nextGallery = append(nextGallery, p.URL)
	}
	
	if nextGallery == nil {
		nextGallery = []string{}
	}

	thumbnailChanged := req.ThumbnailImage.Present
	thumbnailValue := req.ThumbnailImage.Value
	socialLinksJSON, err := marshalSocialLinks(req.SocialLinks)
	if err != nil {
		return nil, fmt.Errorf("marshal social_links: %w", err)
	}

	var (
		bannerURLChanged bool
		bannerURLValue   *string
	)
	if req.BannerURL.Present {
		bannerURLChanged = true
		if req.BannerURL.Value != nil && *req.BannerURL.Value != "" {
			ext := extFromURL(*req.BannerURL.Value)
			filename := BannerFilename(clubName, clubID, ext)

			result, moveErr := r.uploadSvc.MoveObject(ctx, *req.BannerURL.Value, "club/banner", filename)
			if moveErr != nil && result == nil {
				return nil, fmt.Errorf("promote banner image: %w", moveErr)
			}
			bannerURLValue = &result.URL
			if moveErr != nil {
				warnings = append(warnings, moveErr)
			}
		}
		// else: Value is nil -> clearing the banner, bannerURLValue stays nil
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
			image_url      = CASE
								WHEN $8::boolean THEN $9
								ELSE image_url
							END,
			banner_url     = CASE
								WHEN $17::boolean THEN $18
								ELSE banner_url
							END,
			tag_ids        = $10,
			space_ids      = $11,
			gallery_urls   = $12,
			social_links   = COALESCE($13, social_links),
			activate	   = COALESCE($16, activate),
			updated_at     = NOW()
		WHERE id = $14
		AND owner_id = $15::uuid
		AND is_deleted = false`

	result, err := tx.ExecContext(
		ctx, query,
		req.Name, req.Description, req.ClubType, req.Visibility,
		req.MaxSeats, req.CategoryID, req.DisplayStatus,
		thumbnailChanged, thumbnailValue,
		pq.Array(tagIDs), pq.Array(spaceIDs), pq.Array(nextGallery),
		socialLinksJSON,   // $13
		clubID,            // $14
		ownerID,           // $15
		req.Activate,      // $16
		bannerURLChanged,  // $17
		bannerURLValue,    // $18
	)

	if err != nil {
		if isUniqueViolation(err) {
				return nil, ErrClubNameTaken
		}
		return nil, fmt.Errorf("update club: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return nil, err
	}
	if rows == 0 {
		return nil, fmt.Errorf("club not found or not owned by user")
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	for _, p := range promoted {
		if p.Warning != nil {
			warnings = append(warnings, p.Warning)
		}
	}

	return &PatchClubResult{
		GalleryURLsToDelete: req.GalleriesToRemove,
		PromotionWarnings:   warnings,
	}, nil
}

func extFromURL(rawURL string) string {
	idx := strings.LastIndex(rawURL, ".")
	if idx == -1 || idx == len(rawURL)-1 {
		return "png"
	}
	return rawURL[idx+1:]
}


func (r *clubRepository) GetClubGalleryURLs(ctx context.Context, clubID int64, ownerID string) ([]string, error) {
	var raw []byte
	err := r.db.QueryRowContext(ctx,
		`SELECT COALESCE(ARRAY_TO_JSON(gallery_urls)::text, '[]')
		 FROM public.club WHERE id = $1 AND owner_id = $2::uuid AND is_deleted = false`,
		clubID, ownerID,
	).Scan(&raw)
	if err != nil {
		return nil, fmt.Errorf("get club gallery urls: %w", err)
	}
	var urls []string
	if err := json.Unmarshal(raw, &urls); err != nil {
		return nil, fmt.Errorf("unmarshal gallery_urls: %w", err)
	}
	return urls, nil
}

func marshalSocialLinks(v interface{}) ([]byte, error) {
    switch val := v.(type) {
    case json.RawMessage:
        if len(val) == 0 || string(val) == "null" {
            return nil, nil
        }
        return val, nil
    case []map[string]string:
        if len(val) == 0 {
            return nil, nil
        }
        return json.Marshal(val)
    default:
        return nil, nil
    }
}

func (r *clubRepository) GetExistClub(
	ctx context.Context,
	name *string,
) (bool, error) {

	var exist bool

	query := `
	SELECT EXISTS (
		SELECT 1
		FROM public.club
		WHERE $1::text IS NOT NULL
		  AND LOWER(REGEXP_REPLACE(TRIM(name), '\s+', '-', 'g'))
		    = LOWER(REGEXP_REPLACE(TRIM($1), '\s+', '-', 'g'))
	);
	`

	err := r.db.QueryRowContext(ctx, query, name).Scan(&exist)
	if err != nil {
		return false, err
	}

	return exist, nil
}

func (r *clubRepository) GetClubBannerURL(ctx context.Context, clubID int64, ownerID string) (*string, error) {
	var bannerURL *string
	err := r.db.QueryRowContext(ctx,
		`SELECT banner_url FROM public.club WHERE id = $1 AND owner_id = $2::uuid AND is_deleted = false`,
		clubID, ownerID,
	).Scan(&bannerURL)
	if err != nil {
		return nil, fmt.Errorf("get club banner url: %w", err)
	}
	return bannerURL, nil
}