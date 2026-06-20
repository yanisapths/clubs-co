package club

import (
	"club-backend/internal/utils"
	"context"
	"database/sql"
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
			END AS is_member
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
		); err != nil {
			return nil, err
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