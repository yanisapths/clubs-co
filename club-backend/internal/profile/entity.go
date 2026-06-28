package profile

import "time"

type UserEntity struct {
	ID          string
	Email       string
	Username    string
	FirstName   *string
	LastName    *string
	DisplayName *string
	Bio         *string
	ImageURL    *string
	BannerURL   *string
	SocialLinks []byte // raw JSONB
	CreatedAt   time.Time
}

type UserClubEntity struct {
	ClubID    int64
	ClubName  string
	ClubImage *string
	RoleName  string
	JoinedAt  time.Time
	Category  string
}

type UserAssets struct {
	UserImageURL    *string  // users.image_url
	UserBannerURL   *string  // users.banner_url
	ClubImageURLs   []string // image_url of every club the user owns
	ClubGalleryURLs []string // all gallery_urls across every club the user owns
}

func (a *UserAssets) AllURLs() []string {
	out := make([]string, 0)
	if a.UserImageURL != nil && *a.UserImageURL != "" {
		out = append(out, *a.UserImageURL)
	}
	if a.UserBannerURL != nil && *a.UserBannerURL != "" {
		out = append(out, *a.UserBannerURL)
	}
	for _, u := range a.ClubImageURLs {
		if u != "" {
			out = append(out, u)
		}
	}
	for _, u := range a.ClubGalleryURLs {
		if u != "" {
			out = append(out, u)
		}
	}
	return out
}