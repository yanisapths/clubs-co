package user

import "context"


type GetUserExistRepo interface {
	GetExistUser(ctx context.Context, email *string, username *string) (bool, error)
}

type GetPublicProfileRepo interface {
	GetPublicProfileByUsername(ctx context.Context, username string) (*PublicProfile, error)
}
 
type GetPublicUserClubRepo interface {
	GetPublicUserClubStats(ctx context.Context, username string) (*UserClubStats, error)
	GetPublicUserClubList(ctx context.Context, username string) ([]PublicUserClub, error)
}
 
type UserRepository interface {
	GetUserExistRepo
	GetPublicProfileRepo
	GetPublicUserClubRepo
}
 