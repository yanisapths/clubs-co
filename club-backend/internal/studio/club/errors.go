package club

import "errors"

var (
	ErrClubNotFound        = errors.New("club not found")
	ErrNotClubOwner        = errors.New("not club owner")
	ErrInvalidInviteRole   = errors.New("invalid invite role")
	ErrAlreadyMember       = errors.New("already a member")
	ErrInviteAlreadyPending = errors.New("invite already pending")
	ErrTooManyGalleryImages = errors.New("too many gallery images")
	ErrClubNameTaken 		= errors.New("club name already exists")
	ErrUserAlreadyRequestedToJoin = errors.New("member already requested to join, please approve the request.")
	ErrClubQuotaExceeded	= errors.New("quata exceeded. cannot create more than 5 clubs.")
)