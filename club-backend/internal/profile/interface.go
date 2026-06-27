package profile

import "context"

type GetUserProfileRepo interface {
	GetUserInfo(ctx context.Context, ownerID string) (*UserEntity, error)
}

type UserImageURLs struct {
	ImageURL  *string
	BannerURL *string
}

type PatchUserProfileRepo interface {
	GetUserImageURLs(ctx context.Context, ownerID string) (*UserImageURLs, error)
	PatchUser(ctx context.Context, ownerID string, req PatchUserRequest) error
}

type GetUserClubsRepo interface {
	GetUserClubs(ctx context.Context, ownerID string) ([]UserClubEntity, error)
}

type DeleteUserRepo interface {
	GetUserAssetURLs(ctx context.Context, ownerID string) (*UserAssets, error)
	DeleteUser(ctx context.Context, ownerID string) error
}

type ProfileRepository interface {
	GetUserProfileRepo
	PatchUserProfileRepo
	GetUserClubsRepo
	DeleteUserRepo
}