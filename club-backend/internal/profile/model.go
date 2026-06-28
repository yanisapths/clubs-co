package profile

import "encoding/json"

type PatchUserRequest struct {
	FirstName   *string         `json:"firstname"    binding:"omitempty,min=1,max=100"`
	LastName    *string         `json:"lastname"     binding:"omitempty,len=1"`
	DisplayName *string         `json:"displayName"  binding:"omitempty,max=100"`
	Bio         *string         `json:"bio"          binding:"omitempty,max=500"`
	ImageURL    *string         `json:"imageUrl"     binding:"omitempty,url"`
	BannerURL   *string         `json:"bannerUrl"    binding:"omitempty,url"`
	SocialLinks json.RawMessage `json:"socialLinks"`
}

// ── GET /user ─────────────────────────────────────────────────────────────────

type UserInfoResponse struct {
	FirstName   string          `json:"firstname"`
	LastName    string          `json:"lastname"`
	DisplayName string          `json:"displayName"`
	Username    string          `json:"username"`
	SocialLinks json.RawMessage `json:"socialLinks"`
	JoinedAt    int64           `json:"joinedAt"`
	ImageURL    string          `json:"imageUrl"`
	Bio         string          `json:"bio"`
	BannerURL   string          `json:"bannerUrl"`
	Email       string          `json:"email"`
}

// ── GET /user/club ────────────────────────────────────────────────────────────

type ClubStatsResponse struct {
	ClubFounded    int `json:"clubFounded"`
	ClubMembership int `json:"clubMembership"`
	ClubJoined     int `json:"clubJoined"`
}

type UserClubItem struct {
	ID          int64  `json:"id"`
	ImageURL    string `json:"imageUrl"`
	Name        string `json:"name"`
	Role        string `json:"role"`
	MemberSince int64  `json:"memberSince"`
	Category    string `json:"category"`
}

type UserClubsResponse struct {
	Stats ClubStatsResponse `json:"stats"`
	Clubs []UserClubItem    `json:"clubs"`
}