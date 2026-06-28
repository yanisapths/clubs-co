package user

import "context"


type GetUserExistRepo interface {
	GetExistUser(ctx context.Context, email *string, username *string) (bool, error)
}

type UserRepository interface {
	GetUserExistRepo
	
}