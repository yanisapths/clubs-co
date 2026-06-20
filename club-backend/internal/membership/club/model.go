// model.go
package club

type ClubRole struct {
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
	CreatedAt      int64               `json:"createdAt"`
	IsMember       bool      		   `json:"isMember"`
	MemberCount    int64               `json:"memberCount"`
}

type Tag struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}
type GetClubByIDResponse struct {
	ClubInfo ClubInfoResponse `json:"clubInfo"`
	Members  []Member `json:"members"`
}
type Member struct {
	MemberUsername  string `json:"username"`
	MemberID 		string `json:"id"`
	Role    		string `json:"role"`
	JoinedAt		int64  `json:"joinedAt"`
}


type ClubInfoResponse struct {
	ID             int64               `json:"id"`
	Owner        string                `json:"owner"`
	Name           string              `json:"name"`
	Description    string              `json:"description"`
	ImageURL       string              `json:"imageUrl"`
	ClubType       string              `json:"clubType"`
    Visibility     string  			   `json:"visibility"`
	MaxSeats       int                 `json:"maxSeats"`
	AllowFollowers bool                `json:"allowFollowers"`
	Activate       bool                `json:"activate"`
	SocialLinks    []map[string]string `json:"socialLinks"`
	SpaceIDs       []int64             `json:"spaceIds"`
	CategoryName   string              `json:"categoryName"`
	Tags           []Tag               `json:"tags"`
	CreatedAt      int64               `json:"createdAt"`
	UpdatedAt      int64               `json:"updatedAt"`
	IsMember       bool      		   `json:"isMember"`
	MemberCount    int64               `json:"memberCount"`
}