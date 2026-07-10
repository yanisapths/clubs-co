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


type InvitationResponseRepo interface {
	GetClubById(ctx context.Context, clubID int) (*Club, error)
	ResponseToClubInvitation(ctx context.Context, clubID int, userID string, resp InvitationResponse) error
}

type GetClubListByCategorySlugRepo interface {
	GetCategoryBySlug(ctx context.Context, slug string) (*ClubCategory, error)
	GetClubListByByCategorySlug(ctx context.Context, userID *string, categorySlug string, limit,offset int) ([]Club, int, error)
}
type GetClubListPaginatedRepo interface {
	GetClubListPaginated(ctx context.Context, userID *string, limit, offset int) ([]Club, int, error)
}
type MembershipClubRepository interface {
	GetClubListRepo
	SearchRepo
	GetClubCategoryRepo
	JoinClubRepo
	LeaveClubRepo
	GetClubInfoRepo
	GetClubMemberListRepo
	InvitationResponseRepo
	GetClubListByCategorySlugRepo
	GetClubListPaginatedRepo
}