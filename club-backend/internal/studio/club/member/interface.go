package member

import "context"

type MemberRepository interface {
	ApproveMemberRequest(ctx context.Context, ownerID string, clubID int64, memberID string) error
	CancelMemberRequest(ctx context.Context, ownerID string, clubID int64, memberID string) error
	RemoveClubMember(ctx context.Context, ownerID string, clubID int64, memberID string) error
	InviteClubMember(ctx context.Context, inviterID string, clubID int64, req InviteClubMemberRequest) error
}