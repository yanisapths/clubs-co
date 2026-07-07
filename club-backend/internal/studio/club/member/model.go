package member


type InviteClubMemberRequest struct {
	RecipientID string `json:"recipient_id" validate:"required,uuid"`
	RoleID      int64  `json:"role_id"      validate:"required"` // co-founder or member only
}