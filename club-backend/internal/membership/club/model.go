// model.go
package club

type ClubRole struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
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
type ClubResponse struct {
	ID             int64               `json:"id"`
	Name           string              `json:"name"`
	Description    string              `json:"description"`
	ImageURL       string              `json:"imageUrl"`
	ClubType       string              `json:"clubType"`
    Visibility     string  			   `json:"visibility"`
	CategoryName   string              `json:"category"`
	Tags           []Tag               `json:"tags"`
	Spaces 		   []Space   		   `json:"spaces"`
	CreatedAt      int64               `json:"createdAt"`
	IsMember       bool      		   `json:"isMember"`
	IsPending      bool  				`json:"isPending"`
	MemberCount    int64               `json:"memberCount"`
}

type GetClubByIDResponse struct {
	ClubInfo ClubInfoResponse `json:"clubInfo"`
}
type ClubInfoResponse struct {
	ID             int64               `json:"id"`
	Owner          string              `json:"owner"`
	OwnerDisplayName        string     `json:"ownerDisplayName"`
	Name           string              `json:"name"`
	Description    string              `json:"description"`
	ImageURL       string              `json:"imageUrl"`
	BannerURL      *string             `json:"bannerUrl"`
	GalleryURLs    []string            `json:"galleryUrls"`
	ClubType       string              `json:"clubType"`
    Visibility     string  			   `json:"visibility"`
	MaxSeats       int                 `json:"maxSeats"`
	AllowFollowers bool                `json:"allowFollowers"`
	Activate       bool                `json:"activate"`
	SocialLinks    []map[string]string `json:"socialLinks"`
	SpaceIDs       []int64             `json:"spaceIds"`
	Spaces         []Space             `json:"spaces"`
	Category       ClubCategory        `json:"category"` 
	Tags           []Tag               `json:"tags"`
	CreatedAt      int64               `json:"createdAt"`
	UpdatedAt      int64               `json:"updatedAt"`
	IsMember       bool      		   `json:"isMember"`
	IsPending      bool  				`json:"isPending"`
	MemberCount    int64               `json:"memberCount"`
	IsOwner        bool      		   `json:"isOwner"`
	JoinedAt       *int64         	   `json:"joinedAt"`
	MemberRole	   *string  		   `json:"memberRole"`
	Invite 		   *InviteInfo         `json:"invite"`
}
type InviteInfo struct {
	InviterUsername    *string    `json:"inviterUsername"`
	InviterDisplayName *string    `json:"inviterDisplayName"`
	InviterImageURL    *string    `json:"inviterImageUrl"`
	InvitedAt          *int64 	  `json:"invitedAt"`
	InvitedAs          *string    `json:"invitedAs"`
	IsInvited		   bool       `json:"isInvited"`
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

// ── Global search ────────────────────────────────────────────────────────────

// SearchResponse is the unified payload for GET /membership/search.
// Every section is always present (possibly empty) so the client can render
// tabs (All/Clubs/Spaces/Members/Categories) from a single response.
type SearchResponse struct {
	Clubs      []ClubResponse          `json:"clubs"`
	Members    []MemberSearchResponse  `json:"members"`
	Spaces     []SpaceSearchResponse   `json:"spaces"`
	Categories []ClubCategory          `json:"categories"`
}

type MemberSearchResponse struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	ImageURL    string `json:"imageUrl"`
	ClubCount   int64  `json:"clubCount"`
}

type SpaceSearchResponse struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	City      string `json:"city"`
	Country   string `json:"country"`
	ClubCount int64  `json:"clubCount"`
}

type InvitationResponse struct {
	IsAccept  bool       `json:"isAccept"`
}

type Pagination struct {
	Prev	   		*int     `json:"prev"`
	Next	  		*int     `json:"next"`
	Current	  		*int     `json:"current"`
	HasMore   		bool     `json:"hasMore"`
	TotalPages      int      `json:"totalPages"`
	TotalRecords    int      `json:"totalRecords"`
}

type GetClubByCategorySlugResponse struct {
		Category ClubCategory `json:"category"`
		Clubs      []ClubResponse        `json:"clubs"`
		Pagination Pagination  			`json:"pagination"`
}

type GetClubListPaginatedResponse struct {
	Clubs      []ClubResponse `json:"clubs"`
	Pagination Pagination     `json:"pagination"`
}