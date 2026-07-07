// club-backend/internal/studio/club/member/repository.go
package member

import (
	"club-backend/internal/utils"
	"context"
	"database/sql"
	"fmt"
)

type memberRepository struct {
	db *sql.DB
}

func NewMemberRepository(db *sql.DB) MemberRepository {
	return &memberRepository{db: db}
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
	actualOwnerID, err := r.getClubOwnerID(ctx, clubID)
	if err != nil {
		return err
	}
	if actualOwnerID != ownerID {
		return ErrNotClubOwner
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
	actualOwnerID, err := r.getClubOwnerID(ctx, clubID)
	if err != nil {
		return err
	}
	if actualOwnerID != ownerID {
		return ErrNotClubOwner
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

func (r *memberRepository) RemoveClubMember(ctx context.Context, ownerID string, clubID int64, memberID string) error {
	actualOwnerID, err := r.getClubOwnerID(ctx, clubID)
	if err != nil {
		return err
	}
	if actualOwnerID != ownerID {
		return ErrNotClubOwner
	}
	if memberID == ownerID {
		return ErrCannotRemoveFounder
	}

	var rank int
	err = r.db.QueryRowContext(ctx,
		`SELECT cmr.rank
		 FROM public.club_member cm
		 JOIN public.club_member_roles cmr ON cmr.id = cm.role_id
		 WHERE cm.club_id = $1 AND cm.user_id = $2`,
		clubID, memberID,
	).Scan(&rank)
	if err == sql.ErrNoRows {
		return ErrMemberNotFound
	}
	if err != nil {
		return err
	}
	if rank == 1 {
		return ErrCannotRemoveFounder
	}

	result, err := r.db.ExecContext(ctx,
		`DELETE FROM public.club_member WHERE club_id = $1 AND user_id = $2`,
		clubID, memberID,
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