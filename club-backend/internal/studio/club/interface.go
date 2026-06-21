// internal/studio/club/interface.go
package club

import "context"
type CreateClubRepo interface {
	CreateClub(ctx context.Context, ownerID string, req CreateClubRequest) (*Club, error)
}
type GetClubRepo interface {
	GetListClubByOwnerID(ctx context.Context, ownerID string) ([]Club, error)
}
type UpdateClubRepo interface {
	GetClubImageURL(ctx context.Context, clubID int64, ownerID string) (*string, error)
	UpdateClub(ctx context.Context, ownerID string, clubID int64, req UpdateClubRequest) error
}
type DeleteClubRepo interface {
	DeleteClub(ctx context.Context, ownerID string, clubID int64) error 
}
type InviteClubMemberRepo interface {
	InviteClubMember(ctx context.Context, inviterID string, clubID int64, req InviteClubMemberRequest) error
}

type GetClubByIdRepo interface {
	GetClubByIDByOwnerId(ctx context.Context, clubID int64, ownerID string) (*Club, error)
	GetClubMemberByClubID(ctx context.Context, clubID int64) ([]ClubMember, error)
}

type ClubRepository interface {
	CreateClubRepo
	GetClubRepo
	UpdateClubRepo
	DeleteClubRepo
	InviteClubMemberRepo
	GetClubByIdRepo
}