package club

import (
	"context"
)

type GetClubListRepo interface {
	GetClubList(ctx context.Context, userID *string) ([]Club, error)
}

type JoinClubRepo interface {
	JoinClub(ctx context.Context, userID string, clubID int64) error
}

type LeaveClubRepo interface {
	LeaveClub(ctx context.Context, userID string, clubID int64) error
}

type GetClubByIdRepo interface {
	GetClubByID(ctx context.Context, userID *string, clubID int64) (*Club, error)
	GetClubMemberByClubID(ctx context.Context, clubID int64) ([]ClubMember, error)
}

type MembershipClubRepository interface {
	GetClubListRepo
	JoinClubRepo
	LeaveClubRepo
	GetClubByIdRepo
}