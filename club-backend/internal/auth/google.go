// internal/auth/google.go
package auth

import (
	"context"
	"errors"

	"google.golang.org/api/idtoken"
)

var ErrInvalidGoogleToken = errors.New("invalid or expired google token")

// GoogleClaims is the subset of a verified Google ID token we care about.
type GoogleClaims struct {
	Subject       string // "sub" - stable Google user id
	Email         string
	EmailVerified bool
	Name          string
	Picture       string
}

// VerifyGoogleIDToken verifies the raw ID token's signature and audience
// against Google's public keys — this must run server-side; never trust
// a client-supplied profile object instead of doing this.
//
// Requires: go get google.golang.org/api/idtoken
func VerifyGoogleIDToken(ctx context.Context, rawIDToken, googleClientID string) (*GoogleClaims, error) {
	payload, err := idtoken.Validate(ctx, rawIDToken, googleClientID)
	if err != nil {
		return nil, ErrInvalidGoogleToken
	}

	claims := &GoogleClaims{Subject: payload.Subject}
	if v, ok := payload.Claims["email"].(string); ok {
		claims.Email = v
	}
	if v, ok := payload.Claims["email_verified"].(bool); ok {
		claims.EmailVerified = v
	}
	if v, ok := payload.Claims["name"].(string); ok {
		claims.Name = v
	}
	if v, ok := payload.Claims["picture"].(string); ok {
		claims.Picture = v
	}
	return claims, nil
}