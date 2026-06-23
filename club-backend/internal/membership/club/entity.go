package club

import "time"

type Club struct {
	ID             int64             `db:"id"`
	Name           string            `db:"name"`
	Description    *string            `db:"description"`
	ImageURL       *string            `db:"image_url"`
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
	CategoryName   string            `db:"category_name"`
	Tags           []Tag             `db:"tags"`
	IsMember       bool      		 `db:"is_member"`
	MemberCount    int64             `db:"member_count"`
}

type ClubMember struct {
	MemberUsername  string 		`db:"username"`
	MemberFirstame  string 		`db:"first_name"`
	MemberLastname  string 		`db:"last_name"`
	MemberID 		string 		`db:"id"`
	Role     		string  	`db:"role"`
	JoinedAt 		time.Time   `db:"joined_at"`
}