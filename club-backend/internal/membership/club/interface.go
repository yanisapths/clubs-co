package club

import (
	"context"
)

type GetClubListRepo interface {
	GetClubList(ctx context.Context, userID *string) ([]Club, error)
}
type SearchRepo interface {
	SearchClubs(ctx context.Context, userID *string, query string, limit, offset int) ([]Club, error)
	SearchMembers(ctx context.Context, query string, limit, offset int) ([]MemberSearchResult, error)
	SearchSpaces(ctx context.Context, query string, limit, offset int) ([]SpaceSearchResult, error)
	SearchCategories(ctx context.Context, query string, limit, offset int) ([]ClubCategory, error)
}

type GetClubCategoryRepo interface {
	GetClubCategoryList(ctx context.Context) ([]ClubCategory, error)
}

type JoinClubRepo interface {
	JoinClub(ctx context.Context, userID string, clubID int64) (string, error)
}

type LeaveClubRepo interface {
	LeaveClub(ctx context.Context, userID string, clubID int64) error
}

type GetClubInfoRepo interface {
	GetClubByName(ctx context.Context, userID *string, clubName string) (*Club, error)
}

type GetClubMemberListRepo interface {
	GetClubByName(ctx context.Context, userID *string, clubName string) (*Club, error)
	GetClubMemberByClubID(ctx context.Context, clubID int64, includePending bool) ([]ClubMember, error)
	IsClubOwnerOrCoFounder(ctx context.Context,clubID int64,userID string,) (bool, error)
}

type MembershipClubRepository interface {
	GetClubListRepo
	SearchRepo
	GetClubCategoryRepo
	JoinClubRepo
	LeaveClubRepo
	GetClubInfoRepo
	GetClubMemberListRepo
}