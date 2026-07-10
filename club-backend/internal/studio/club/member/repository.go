// club-backend/internal/studio/club/member/repository.go
package member

import (
	"club-backend/internal/utils"
	"context"
	"database/sql"
	"fmt"
)

//  Founder cannot remove themselves or leave club, they can invite, approve, cancel, kick other member from club
//  Co founder can leave club, Co founder cannot do any action to higher rank than them but they can invite, approve, cancel, kick other lower member from club
//  member can leave club
type memberRepository struct {
	db *sql.DB
}

func NewMemberRepository(db *sql.DB) MemberRepository {
	return &memberRepository{db: db}
}

func (r *memberRepository) getActiveMemberRank(
	ctx context.Context,
	clubID int64,
	userID string,
) (int, error) {
	var rank int

	err := r.db.QueryRowContext(ctx, `
		SELECT cmr.rank
		FROM public.club_member cm
		JOIN public.club_member_roles cmr
			ON cmr.id = cm.role_id
		WHERE cm.club_id = $1
			AND cm.user_id = $2
			AND cm.status = 'Active'
	`,
		clubID,
		userID,
	).Scan(&rank)

	if err == sql.ErrNoRows {
		return 0, ErrNotClubOwner
	}

	return rank, err
}

func (r *memberRepository) canManageMember(
	ctx context.Context,
	clubID int64,
	actorID string,
	targetID string,
) error {
	var actorRank int

	err := r.db.QueryRowContext(ctx, `
		SELECT cmr.rank
		FROM public.club_member cm
		JOIN public.club_member_roles cmr
			ON cmr.id = cm.role_id
		WHERE cm.club_id = $1
			AND cm.user_id = $2
			AND cm.status = 'Active'
	`,
		clubID,
		actorID,
	).Scan(&actorRank)

	if err == sql.ErrNoRows {
		return ErrNotClubOwner
	}
	if err != nil {
		return err
	}

	var targetRank int

	err = r.db.QueryRowContext(ctx, `
		SELECT cmr.rank
		FROM public.club_member cm
		JOIN public.club_member_roles cmr
			ON cmr.id = cm.role_id
		WHERE cm.club_id = $1
			AND cm.user_id = $2
	`,
		clubID,
		targetID,
	).Scan(&targetRank)

	if err == sql.ErrNoRows {
		return ErrMemberNotFound
	}
	if err != nil {
		return err
	}

	// Lower rank number = higher privilege
	// Founder(1) can manage CoFounder(2) and Member(3)
	// CoFounder(2) can manage Member(3)
	// Member(3) cannot manage anyone
	if actorRank >= targetRank {
		return ErrInsufficientPermission
	}

	return nil
}

func (r *memberRepository) getClubOwnerID(ctx context.Context, clubID int64) (string, error) {
	var ownerID string
	err := r.db.QueryRowContext(ctx,
		`SELECT owner_id FROM public.club WHERE id = $1 AND is_deleted = false`,
		clubID,
	).Scan(&ownerID)
	if err == sql.ErrNoRows {
		return "", ErrClubNotFound
	}
	return ownerID, err
}

func (r *memberRepository) ApproveMemberRequest(ctx context.Context, ownerID string, clubID int64, memberID string) error {
	actorRank, err := r.getActiveMemberRank(ctx, clubID, ownerID)
	if err != nil {
		return err
	}

	if actorRank > 2 {
		return ErrInsufficientPermission
	}

	result, err := r.db.ExecContext(ctx,
		`UPDATE public.club_member
		 SET status = 'Active'
		 WHERE club_id = $1 AND user_id = $2 AND status = 'Pending'`,
		clubID, memberID,
	)
	if err != nil {
		return fmt.Errorf("approve member request: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrMemberRequestNotFound
	}
	return nil
}

// CancelMemberRequest cancels either a pending join request (self-initiated,
// status='Pending' in club_member) or an outstanding invitation the owner sent
// (club_member_invite), whichever matches memberID for this club.
func (r *memberRepository) CancelMemberRequest(ctx context.Context, ownerID string, clubID int64, memberID string) error {
	actorRank, err := r.getActiveMemberRank(ctx, clubID, ownerID)
	if err != nil {
		return err
	}

	if actorRank > 2 {
		return ErrInsufficientPermission
	}

	result, err := r.db.ExecContext(ctx,
		`DELETE FROM public.club_member
		 WHERE club_id = $1 AND user_id = $2 AND status = 'Pending'`,
		clubID, memberID,
	)
	if err != nil {
		return fmt.Errorf("cancel member request: %w", err)
	}
	if rows, err := result.RowsAffected(); err != nil {
		return err
	} else if rows > 0 {
		return nil
	}

	result, err = r.db.ExecContext(ctx,
		`DELETE FROM public.club_member_invite
		 WHERE club_id = $1 AND recipient_id = $2
		   AND invitation_response = false
		   AND (expires_at IS NULL OR expires_at > NOW())`,
		clubID, memberID,
	)
	if err != nil {
		return fmt.Errorf("cancel member invitation: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrMemberRequestNotFound
	}
	return nil
}

func (r *memberRepository) RemoveClubMember(
	ctx context.Context,
	actorID string,
	clubID int64,
	memberID string,
) error {

	actorRank, err := r.getActiveMemberRank(ctx, clubID, actorID)
	if err != nil {
		return err
	}

	// User leaving the club
	if actorID == memberID {
		if actorRank == 1 {
			return ErrCannotRemoveFounder
		}

		result, err := r.db.ExecContext(ctx,
			`DELETE FROM public.club_member
			 WHERE club_id = $1 AND user_id = $2`,
			clubID,
			memberID,
		)
		if err != nil {
			return err
		}

		rows, err := result.RowsAffected()
		if err != nil {
			return err
		}
		if rows == 0 {
			return ErrMemberNotFound
		}

		return nil
	}

	// Kicking another member
	if err := r.canManageMember(ctx, clubID, actorID, memberID); err != nil {
		return err
	}

	result, err := r.db.ExecContext(ctx,
		`DELETE FROM public.club_member
		 WHERE club_id = $1 AND user_id = $2`,
		clubID,
		memberID,
	)
	if err != nil {
		return fmt.Errorf("remove club member: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrMemberNotFound
	}

	return nil
}

func (r *memberRepository) InviteClubMember(ctx context.Context, inviterID string, clubID int64, req InviteClubMemberRequest) error {
	actorRank, err := r.getActiveMemberRank(ctx, clubID, inviterID)
	if err != nil {
		return err
	}
	
	if actorRank > 2 {
		return ErrInsufficientPermission
	}

	var targetRoleRank int
	err = r.db.QueryRowContext(ctx, `
		SELECT rank
		FROM public.club_member_roles
		WHERE id = $1
	`, req.RoleID).Scan(&targetRoleRank)

	if err == sql.ErrNoRows {
		return ErrInvalidInviteRole
	}
	if err != nil {
		return err
	}

	if actorRank >= targetRoleRank {
		return ErrInsufficientPermission
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

	var alreadyRequested bool
	err = r.db.QueryRowContext(ctx,
		`SELECT EXISTS(
			SELECT 1 FROM public.club_member
			WHERE club_id = $1 AND user_id = $2 AND status = 'Pending'
		)`,
		clubID, req.RecipientID,
	).Scan(&alreadyRequested)
	if err != nil {
		return err
	}
	if alreadyRequested {
		return ErrUserAlreadyRequestedToJoin
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