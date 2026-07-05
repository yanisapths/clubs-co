package club

import "errors"

var (
	ErrClubNotPublic = errors.New("club is not public")
	ErrClubFull      = errors.New("club is full")
	ErrClubNotFound        = errors.New("club not found")
	ErrNotMember        = errors.New("not a member")
	ErrFounderCannotLeave = errors.New("founder cannot leave the club")
	ErrAlreadyMember       = errors.New("already a member")
	ErrRequestPending      = errors.New("join request already pending")
)