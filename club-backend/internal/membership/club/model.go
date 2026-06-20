// model.go
package club

import "time"

type ClubRole struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type ClubMember struct {
	ClubID   int64     `json:"clubId"`
	UserID   string    `json:"userId"`
	Role     ClubRole  `json:"role"`
	JoinedAt time.Time `json:"joinedAt"`
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