package user

type CheckExist struct {
	Query *string
}


type PublicProfileResponse struct {
	ID          string              `json:"id"`
	Username    string              `json:"username"`
	DisplayName string              `json:"displayName"`
	Bio         string              `json:"bio"`
	ImageURL    string              `json:"imageUrl"`
	BannerURL   string              `json:"bannerUrl"`
	SocialLinks []map[string]string `json:"socialLinks"`
	JoinedAt    int64               `json:"joinedAt"`
}
 
type PublicUserClubItem struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	ImageURL    string `json:"imageUrl"`
	Category    string `json:"category"`
	Role        string `json:"role"`
	MemberSince int64  `json:"memberSince"`
}
 
type UserClubStatsResponse struct {
	ClubFounded    int64 `json:"clubFounded"`
	ClubJoined     int64 `json:"clubJoined"`
	ClubMembership int64 `json:"clubMembership"`
}
 
type PublicUserClubResponse struct {
	Stats UserClubStatsResponse `json:"stats"`
	Clubs []PublicUserClubItem  `json:"clubs"`
}
 