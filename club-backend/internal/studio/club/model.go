// internal/studio/club/model.go
package club

import (
	"club-backend/internal/utils"
	"encoding/json"
)

type CreateClubRequest struct {
	Name        string       `json:"name"        binding:"required,max=100"`
	ThumbnailImage *string    `json:"thumbnailImage"   binding:"omitempty"`
	Description string       `json:"description" binding:"max=250"`
	MaxSeats    int          `json:"maxSeats"    binding:"required,min=3,max=200"`
	ClubType    string       `json:"clubType"    binding:"required,oneof=Public Private Exclusive"`
	Visibility  string       `json:"visibility"  binding:"required,oneof=Anyone MemberOnly"`
	CategoryID  int64        `json:"categoryId"  binding:"required"`
	Tags        []TagInput   `json:"tags"        binding:"omitempty,max=5"`
	Spaces      []SpaceInput `json:"spaces"`
    Activate *bool `json:"activate"`
	SocialLinks json.RawMessage `json:"socialLinks"`
}
type CreateClubResponse struct {
	ID             int64               `json:"id"`
}
type TagInput struct {
	ID   *int64  `json:"id"`  
	Name *string `json:"name"` 
}

type SpaceInput struct {
	ID      *int64  `json:"id"`    
	Name    *string `json:"name"`  
	Country *string `json:"country"`
	City    *string `json:"city"`
}

type ClubResponse struct {
	ID             int64               `json:"id"`
	Owner          string              `json:"owner"`
	OwnerDisplayName        string     `json:"ownerDisplayName"`
	Name           string              `json:"name"`
	Description    string              `json:"description"`
	ImageURL       string              `json:"imageUrl"`
	BannerURL      string              `json:"bannerUrl"`
	GalleryURLs    []string            `json:"galleryUrls"`
	ClubType       string              `json:"clubType"`
    Visibility     string  			   `json:"visibility"`
	MaxSeats       int                 `json:"maxSeats"`
	AllowFollowers bool                `json:"allowFollowers"`
	Activate       bool                `json:"activate"`
	SocialLinks    []map[string]string `json:"socialLinks"`
	Spaces         []Space             `json:"spaces"`
	Category       ClubCategory        `json:"category"` 
	Tags           []Tag               `json:"tags"`
	CreatedAt      int64               `json:"createdAt"`
	UpdatedAt      int64               `json:"updatedAt"`
	MemberCount    int                 `json:"memberCount"`
	PendingMemberCount	int            `json:"pendingMemberCount"`
	PendingInviteCount 	int 		   `json:"pendingInviteCount"`
	MemberRole	   string              `json:"memberRole"`
}

type ClubCategory struct {
	ID   int 	 	`json:"id"`
	Name string     `json:"name"`
	Slug string     `json:"slug"`
}

type Space struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type Tag struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}
type UpdateClubRequest struct {
	Name          *string      `json:"name"          binding:"omitempty,min=1,max=100"`
	Description   *string      `json:"description"   binding:"omitempty,max=250"`
	MaxSeats      *int         `json:"maxSeats"      binding:"omitempty,min=3,max=200"`
	ClubType      *string      `json:"clubType"      binding:"omitempty,oneof=Public Private Exclusive"`
	Visibility    *string      `json:"visibility"    binding:"omitempty,oneof=Anyone MemberOnly"`
	CategoryID    *int64       `json:"categoryId"`
	DisplayStatus *string      `json:"displayStatus"`
	Tags          []TagInput   `json:"tags"          binding:"omitempty,max=3"`
	Spaces        []SpaceInput `json:"spaces"`
	ThumbnailImage utils.NullableString `json:"thumbnailImage"`
	SocialLinks json.RawMessage `json:"socialLinks"`
}

type InviteClubMemberRequest struct {
	RecipientID string `json:"recipientId" validate:"required,uuid"`
	RoleID      int64  `json:"roleId"      validate:"required"` // co-founder or member only
}

type GetClubByIDResponse struct {
	ClubInfo ClubResponse `json:"clubInfo"`
}
type ClubMemberResponse struct {
	Members  []Member `json:"members"`
}

type Member struct {
	MemberDisplayName *string `json:"displayName"`
	MemberUsername  string `json:"username"`
	MemberID 		string `json:"id"`
	Role    		string `json:"role"`
	JoinedAt		int64  `json:"joinedAt"`
	IsPending       bool   `json:"isPending"`
	IsInvited       bool   `json:"isInvited"`
}

const MaxGalleryImages = 20

type PatchClubRequest struct {
	Name          *string      `json:"name"          binding:"omitempty,min=2,max=100"`
	Description   *string      `json:"description"   binding:"omitempty,max=250"`
	MaxSeats      *int         `json:"maxSeats"      binding:"omitempty,min=3,max=200"`
	ClubType      *string      `json:"clubType"      binding:"omitempty,oneof=Public Private Exclusive"`
	Visibility    *string      `json:"visibility"    binding:"omitempty,oneof=Anyone MemberOnly"`
	CategoryID    *int64       `json:"categoryId"`
	DisplayStatus *string      `json:"displayStatus"`
	Tags          []TagInput   `json:"tags"          binding:"omitempty,max=3"`
	Spaces        []SpaceInput `json:"spaces"`
	ThumbnailImage utils.NullableString `json:"thumbnailImage"`
	BannerURL     utils.NullableString `json:"bannerUrl"`
	GalleriesToAdd []string `json:"galleriesToAdd" binding:"omitempty,dive,url"`
	GalleriesToRemove []string `json:"galleriesToRemove" binding:"omitempty,dive,url"`
	SocialLinks json.RawMessage `json:"socialLinks"`
	Activate *bool `json:"activate"`
}

type promotedGalleryImage struct {
	URL     string
	Warning error
}
type PatchClubResult struct {
	GalleryURLsToDelete []string
	PromotionWarnings   []error
}