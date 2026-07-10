package profile

import "encoding/json"

type PatchUserRequest struct {
	DisplayName *string         `json:"displayName"  binding:"omitempty,min=3,max=50"`
	Bio         *string         `json:"bio"          binding:"omitempty,max=500"`
	ImageURL    *string         `json:"imageUrl"     binding:"omitempty,url"`
	BannerURL   *string         `json:"bannerUrl"    binding:"omitempty,url"`
	SocialLinks json.RawMessage `json:"socialLinks"`
}

// ── GET /user ─────────────────────────────────────────────────────────────────

type UserInfoResponse struct {
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
	ClubJoined     int `json:"clubJoined"`
}

type UserClubItem struct {
	ID          int64  `json:"id"`
	ImageURL    string `json:"imageUrl"`
	Name        string `json:"name"`
	Role        string `json:"role"`
	MemberSince int64  `json:"memberSince"`
	Category    string `json:"category"`
	ActiveMemberCount int64  `json:"activeMemberCount"`
}

type UserClubsResponse struct {
	Stats ClubStatsResponse `json:"stats"`
	Clubs []UserClubItem    `json:"clubs"`
}