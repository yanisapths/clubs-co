// internal/studio/club/model.go
package club

type CreateClubRequest struct {
	Name        string       `json:"name"        binding:"required,min=2,max=100"`
	Description string       `json:"description" binding:"max=250"`
	MaxSeats    int          `json:"maxSeats"    binding:"required,min=1,max=200"`
	ClubType    string       `json:"clubType"    binding:"required,oneof=Public Private Exclusive"`
	Visibility  string       `json:"visibility"  binding:"required,oneof=Anyone MemberOnly"`
	CategoryID  int64        `json:"categoryId"  binding:"required"`
	Tags        []TagInput   `json:"tags"        binding:"omitempty,max=3"`
	Spaces      []SpaceInput `json:"spaces"`
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

type UpdateClubRequest struct {
	Name        *string `json:"name"        binding:"omitempty,min=2,max=100"`
	Description *string `json:"description" binding:"omitempty,max=500"`
	IsPublic    *bool   `json:"is_public"`
}

type ClubResponse struct {
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
}

type Tag struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}