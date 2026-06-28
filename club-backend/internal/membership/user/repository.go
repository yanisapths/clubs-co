package user

import (
	"context"
	"database/sql"
)

type membershipUserRepository struct {
	db *sql.DB
}

func NewMembershipUserRepository(db *sql.DB) UserRepository {
	return &membershipUserRepository{
		db: db,
	}
}

func (r *membershipUserRepository) GetExistUser(
	ctx context.Context,
	email *string,
	username *string,
) (bool, error) {

	var exist bool

	query := `
	SELECT EXISTS (
		SELECT 1
		FROM public.users
		WHERE
			($1::text IS NOT NULL AND email = $1)
			OR
			($2::text IS NOT NULL AND username = $2)
			)
		`

	err := r.db.QueryRowContext(
		ctx,
		query,
		email,
		username,
	).Scan(&exist)

	if err != nil {
		return false, err
	}

	return exist, nil
}