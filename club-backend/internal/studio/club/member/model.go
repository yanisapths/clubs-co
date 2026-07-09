package member


type InviteClubMemberRequest struct {
	RecipientID string `json:"recipientId" validate:"required,uuid"`
	RoleID      int64  `json:"roleId"      validate:"required"` // co-founder or member only
}