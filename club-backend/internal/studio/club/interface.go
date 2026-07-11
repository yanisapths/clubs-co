// internal/studio/club/interface.go
package club

import "context"
type CreateClubRepo interface {
	CreateClub(ctx context.Context, ownerID string, req CreateClubRequest) (*Club, error)
	CountClubByOwnerID(ctx context.Context, ownerID string) (int, error)
}
type GetClubRepo interface {
	GetListClubByOwnerID(ctx context.Context, ownerID string) ([]Club, error)
}
type UpdateClubRepo interface {
	GetClubImageURL(ctx context.Context, clubID int64, ownerID string) (*string, error)
	UpdateClub(ctx context.Context, ownerID string, clubID int64, req UpdateClubRequest, clubInfo Club) error
	GetClubByIDByOwnerId(ctx context.Context, clubID int64, ownerID string) (*Club, error)
	GetCategoryById(ctx context.Context, categoryID int64) (*ClubCategory, error)
}
type DeleteClubRepo interface {
	DeleteClub(ctx context.Context, ownerID string, clubID int64) error 
}

type GetClubByIdRepo interface {
	GetClubByIDByOwnerId(ctx context.Context, clubID int64, ownerID string) (*Club, error)
}
type PatchClubByIdRepo interface {
	GetClubImageURL(ctx context.Context, clubID int64, ownerID string) (*string, error)
	GetClubGalleryURLs(ctx context.Context, clubID int64, ownerID string) ([]string, error)
	PatchClub(ctx context.Context, ownerID string, clubID int64, req PatchClubRequest) (*PatchClubResult, error) 
	GetClubBannerURL(ctx context.Context, clubID int64, ownerID string) (*string, error)
}

type GetClubExistRepo interface {
	GetExistClub(ctx context.Context, name *string) (bool, error)
}

type GetClubMemberListByIdRepo interface {
	GetClubByIDByOwnerId(ctx context.Context, clubID int64, ownerID string) (*Club, error)
	GetClubMemberByClubID(ctx context.Context, clubID int64) ([]ClubMember, error)
}

type ClubRepository interface {
	CreateClubRepo
	GetClubRepo
	UpdateClubRepo
	DeleteClubRepo
	GetClubByIdRepo
	PatchClubByIdRepo
	GetClubExistRepo
	GetClubMemberListByIdRepo
}