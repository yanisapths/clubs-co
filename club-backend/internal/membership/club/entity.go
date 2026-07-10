package club

import "time"

type Club struct {
	ID             int64             `db:"id"`
	Name           string            `db:"name"`
	Description    *string            `db:"description"`
	ImageURL       *string            `db:"image_url"`
	BannerURL      *string            `db:"banner_url"`
	GalleryURLs    []string 		 `db:"gallery_urls"`
	ClubType       string            `db:"club_type"`
	Visibility     string            `db:"visibility"`
	MaxSeats       int               `db:"max_seats"`
	AllowFollowers bool              `db:"allow_followers"`
	Activate       bool              `db:"activate"`
	SocialLinks    []map[string]string `db:"social_links"`
	SpaceIDs       []int64           `db:"space_ids"`
	CreatedAt      time.Time         `db:"created_at"`
	UpdatedAt      time.Time         `db:"updated_at"`
	Owner          string            `db:"owner"`
	OwnerID        string            `db:"owner_id"`
	OwnerDisplayName  string 		 `db:"display_name"`
	CategoryID     int          	 `db:"category_id"`
	CategoryName   string            `db:"category_name"`
	Tags           []Tag             `db:"tags"`
	Spaces         []Space           `db:"spaces"`
	IsMember       bool      		 `db:"is_member"`
	MemberCount    int64             `db:"member_count"`
	IsOwner        bool      		 `db:"is_owner"`
	JoinedAt 	   *time.Time 		 `db:"joined_at"`
	MemberRole 	   *string           `db:"member_role"`
	IsPending      bool      		 `db:"is_pending"`
}

type ClubMember struct {
	MemberDisplayName  *string 		`db:"display_name"`
	MemberUsername  string 		`db:"username"`
	MemberID 		string 		`db:"id"`
	Role     		string  	`db:"role"`
	JoinedAt 		time.Time   `db:"joined_at"`
	IsPending       bool        `db:"is_pending"`
	IsInvited       bool        `db:"is_invited"`
}

// MemberSearchResult represents a user matched by a global search query.
type MemberSearchResult struct {
	ID          string  `db:"id"`
	Username    string  `db:"username"`
	DisplayName string  `db:"display_name"`
	ImageURL    *string `db:"image_url"`
	ClubCount   int64   `db:"club_count"`
}

// SpaceSearchResult represents a physical/location space matched by a global search query.
type SpaceSearchResult struct {
	ID        int64   `db:"id"`
	Name      string  `db:"name"`
	Slug      string  `db:"slug"`
	City      *string `db:"city"`
	Country   *string `db:"country"`
	ClubCount int64   `db:"club_count"`
}