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

type MembershipClubRepository interface {
	GetClubListRepo
	JoinClubRepo
	LeaveClubRepo
}