package user

import "time"

type PublicProfile struct {
	ID          string              `db:"id"`
	Username    string              `db:"username"`
	DisplayName *string             `db:"display_name"`
	Bio         *string             `db:"bio"`
	ImageURL    *string             `db:"image_url"`
	BannerURL   *string             `db:"banner_url"`
	SocialLinks []map[string]string `db:"social_links"`
	JoinedAt    time.Time           `db:"created_at"`
}
type PublicUserClub struct {
	ID           int64     `db:"id"`
	Name         string    `db:"name"`
	ImageURL     *string   `db:"image_url"`
	CategoryName string    `db:"category_name"`
	Role         string    `db:"role"`
	JoinedAt     time.Time `db:"joined_at"`
}
 
type UserClubStats struct {
	ClubFounded    int64 `db:"club_founded"`
	ClubJoined     int64 `db:"club_joined"`
	ClubMembership int64 `db:"club_membership"`
}
 