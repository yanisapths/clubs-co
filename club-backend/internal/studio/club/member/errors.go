package member

import "errors"

var (
	ErrClubNotFound          = errors.New("club not found")
	ErrNotClubOwner          = errors.New("not club owner")
	ErrMemberNotFound        = errors.New("member not found")
	ErrMemberRequestNotFound = errors.New("pending request or invitation not found for this member")
	ErrCannotRemoveFounder   = errors.New("cannot remove the club founder")


	ErrInvalidInviteRole   = errors.New("invalid invite role")
	ErrAlreadyMember       = errors.New("already a member")
	ErrInviteAlreadyPending = errors.New("invite already pending")
	ErrUserAlreadyRequestedToJoin = errors.New("member already requested to join, please approve the request.")

	ErrInsufficientPermission = errors.New("insufficient permission")
	ErrClubFull      = errors.New("club is full")
)