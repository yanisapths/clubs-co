package club

import (
	"context"
)

type GetClubListRepo interface {
	GetClubList(ctx context.Context, userID *string) ([]Club, error)
}

// SearchRepo backs the unified GET /membership/search endpoint.
// It searches across clubs, members, spaces, and categories independently —
// each method applies its own ILIKE filter and returns [] rather than erroring
// when nothing matches.
type SearchRepo interface {
	SearchClubs(ctx context.Context, userID *string, query string) ([]Club, error)
	SearchMembers(ctx context.Context, query string) ([]MemberSearchResult, error)
	SearchSpaces(ctx context.Context, query string) ([]SpaceSearchResult, error)
	SearchCategories(ctx context.Context, query string) ([]ClubCategory, error)
}

type GetClubCategoryRepo interface {
	GetClubCategoryList(ctx context.Context) ([]ClubCategory, error)
}

type JoinClubRepo interface {
	JoinClub(ctx context.Context, userID string, clubID int64) error
}

type LeaveClubRepo interface {
	LeaveClub(ctx context.Context, userID string, clubID int64) error
}

type GetClubInfoRepo interface {
	GetClubByName(ctx context.Context, userID *string, clubName string) (*Club, error)
	GetClubMemberByClubID(ctx context.Context, clubID int64) ([]ClubMember, error)
}

type MembershipClubRepository interface {
	GetClubListRepo
	SearchRepo
	GetClubCategoryRepo
	JoinClubRepo
	LeaveClubRepo
	GetClubInfoRepo
}