// internal/studio/club/interface.go
package club

import "context"

type CreateClubRepo interface {
	CreateClub(ctx context.Context, ownerID string, req CreateClubRequest) (*Club, error)
}


type GetClubRepo interface {
	GetListClubByOwnerID(ctx context.Context, ownerID string) ([]Club, error)
}
 
// type UpdateClubRepo interface {
// 	UpdateClub(ctx context.Context, ownerID string, req UpdateClubRequest) (*Club, error)
// }

type DeleteClubRepo interface {
	DeleteClub(ctx context.Context, ownerID string) error
}

type ClubRepository interface {
	CreateClubRepo
	GetClubRepo
	// UpdateClubRepo
	DeleteClubRepo
}