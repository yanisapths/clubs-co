// internal/studio/club/entity.go
package club

import (
	"errors"
	"time"

	"github.com/lib/pq"
)

type Club struct {
	ID             int64             `db:"id"`
	Name           string            `db:"name"`
	Description    *string            `db:"description"`
	ImageURL       *string            `db:"image_url"`
	BannerURL      *string            `db:"banner_url"`
	ClubType       string            `db:"club_type"`
	Visibility     string            `db:"visibility"`
	MaxSeats       int               `db:"max_seats"`
	AllowFollowers bool              `db:"allow_followers"`
	Activate       bool              `db:"activate"`
	SocialLinks    []map[string]string `db:"social_links"`
	Spaces         []Space           `db:"spaces"`
	CreatedAt      time.Time         `db:"created_at"`
	UpdatedAt      time.Time         `db:"updated_at"`
	Owner          string            `db:"owner"`
	OwnerID        string            `db:"owner_id"`
	CategoryID     int               `db:"category_id"`
	CategoryName   string            `db:"category_name"`
	Tags           []Tag             `db:"tags"`
	GalleryURLs    []string 		 `db:"gallery_urls"`
	OwnerDisplayName string          `db:"display_name"`
	MemberCount 	int               `db:"member_count"`
}

type ClubMember struct {
	MemberUsername  string 		`db:"username"`
	MemberDisplayName  *string 	`db:"display_name"`
	MemberID 		string 		`db:"id"`
	Role     		string  	`db:"role"`
	JoinedAt 		time.Time   `db:"joined_at"`
}

func isUniqueViolation(err error) bool {
    var pqErr *pq.Error 
    if errors.As(err, &pqErr) {
        return pqErr.Code == "23505"
    }
    return false
}