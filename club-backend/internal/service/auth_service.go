// club-backend/internal/service/auth_service.go
package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"club-backend/internal/auth"
	"club-backend/internal/config"
	"club-backend/internal/model"
	"club-backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

// --- Request / Response DTOs ---

type SignUpRequest struct {
	Email     string `json:"email"      binding:"required,email"`
	Username  string `json:"username"   binding:"required,min=3,max=30,username"`
	Password  string `json:"password"   binding:"required,min=8"`
	DisplayName string `json:"displayName" binding:"required,min=3,max=50,displayName"`
}

type LoginRequest struct {
	// Accept either email or username
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password"   binding:"required"`
}

// GoogleSignInRequest carries the raw Google ID token from the frontend
// (NextAuth's account.id_token for the "google" provider). We verify it
// server-side rather than trusting any client-supplied profile fields.
type GoogleSignInRequest struct {
	IDToken string `json:"id_token" binding:"required"`
}

type AuthResponse struct {
	User   *UserResponse    `json:"user"`
	Tokens *auth.TokenPair  `json:"tokens"`
}

type UserResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	DisplayName string `json:"displayName"`
}

// --- Service errors ---

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailTaken         = errors.New("email already registered")
	ErrUsernameTaken      = errors.New("username already taken")
	ErrAccountInactive    = errors.New("account is inactive")
	ErrGoogleEmailNotVerified = errors.New("google account email is not verified")
)

// --- Interface ---

type AuthService interface {
	SignUp(ctx context.Context, req *SignUpRequest) (*AuthResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error)
	GoogleSignIn(ctx context.Context, req *GoogleSignInRequest) (*AuthResponse, error)
	GetUserByID(ctx context.Context, id string) (*UserResponse, error)
}

// --- Implementation ---

type authService struct {
	userRepo       repository.UserRepository
	jwtCfg         config.JWTConfig
	googleClientID string
}

// NewAuthService now also takes the Google OAuth client ID, used to verify
// the audience of incoming Google ID tokens. Update the call site in
// main.go: service.NewAuthService(userRepo, cfg.JWT, cfg.Google.ClientID)
func NewAuthService(userRepo repository.UserRepository, jwtCfg config.JWTConfig, googleClientID string) AuthService {
	return &authService{userRepo: userRepo, jwtCfg: jwtCfg, googleClientID: googleClientID}
}

func (s *authService) SignUp(ctx context.Context, req *SignUpRequest) (*AuthResponse, error) {
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Username = strings.TrimSpace(req.Username)

	// Check uniqueness
	emailExists, err := s.userRepo.ExistsByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if emailExists {
		return nil, ErrEmailTaken
	}

	usernameExists, err := s.userRepo.ExistsByUsername(ctx, req.Username)
	if err != nil {
		return nil, err
	}
	if usernameExists {
		return nil, ErrUsernameTaken
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		DisplayName:  req.DisplayName,
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hash),
		IsActive:     true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		switch {
		case errors.Is(err, repository.ErrDuplicateEmail):
			return nil, ErrEmailTaken
		case errors.Is(err, repository.ErrDuplicateUsername):
			return nil, ErrUsernameTaken
		}
		return nil, err
	}

	tokens, err := auth.GenerateTokenPair(user.ID, user.Email, s.jwtCfg.Secret, s.jwtCfg.AccessTokenTTL, s.jwtCfg.RefreshTokenTTL)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{User: toUserResponse(user), Tokens: tokens}, nil
}

func (s *authService) Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	identifier := strings.TrimSpace(req.Identifier)

	// Determine lookup strategy: email vs username
	var user *model.User
	var err error

	if strings.Contains(identifier, "@") {
		user, err = s.userRepo.FindByEmail(ctx, strings.ToLower(identifier))
	} else {
		user, err = s.userRepo.FindByUsername(ctx, identifier)
	}

	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, err
	}

	if !user.IsActive {
		return nil, ErrAccountInactive
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	tokens, err := auth.GenerateTokenPair(user.ID, user.Email, s.jwtCfg.Secret, s.jwtCfg.AccessTokenTTL, s.jwtCfg.RefreshTokenTTL)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{User: toUserResponse(user), Tokens: tokens}, nil
}

// GoogleSignIn verifies the Google ID token, then either:
//  1. finds an existing user already linked to this Google account,
//  2. links an existing password account with the same email, or
//  3. creates a brand-new Google-only account.
//
// Either way it returns the same AuthResponse shape as SignUp/Login so the
// frontend treats all three flows identically.
func (s *authService) GoogleSignIn(ctx context.Context, req *GoogleSignInRequest) (*AuthResponse, error) {
	claims, err := auth.VerifyGoogleIDToken(ctx, req.IDToken, s.googleClientID)
	if err != nil {
		return nil, err
	}
	if !claims.EmailVerified {
		return nil, ErrGoogleEmailNotVerified
	}
	email := strings.ToLower(strings.TrimSpace(claims.Email))

	// 1. Already linked?
	user, err := s.userRepo.FindByGoogleID(ctx, claims.Subject)
	switch {
	case err == nil:
		// found, fall through to token issuance below

	case errors.Is(err, repository.ErrNotFound):
		// 2. Existing password account with the same email? Link it.
		user, err = s.userRepo.FindByEmail(ctx, email)
		switch {
		case err == nil:
			if linkErr := s.userRepo.LinkGoogleID(ctx, user.ID, claims.Subject); linkErr != nil {
				return nil, linkErr
			}

		case errors.Is(err, repository.ErrNotFound):
			// 3. Brand-new Google-only account.
			user, err = s.createGoogleUser(ctx, claims, email)
			if err != nil {
				return nil, err
			}

		default:
			return nil, err
		}

	default:
		return nil, err
	}

	if !user.IsActive {
		return nil, ErrAccountInactive
	}

	tokens, err := auth.GenerateTokenPair(user.ID, user.Email, s.jwtCfg.Secret, s.jwtCfg.AccessTokenTTL, s.jwtCfg.RefreshTokenTTL)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{User: toUserResponse(user), Tokens: tokens}, nil
}

func (s *authService) createGoogleUser(ctx context.Context, claims *auth.GoogleClaims, email string) (*model.User, error) {
	displayName := claims.Name
	if displayName == "" {
		displayName = strings.Split(email, "@")[0]
	}

	username, err := s.uniqueUsernameFromEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	// PasswordHash is `not null` in the schema; Google-only accounts get an
	// unguessable random hash so password login can never succeed for them.
	unusableHash, err := randomUnusablePasswordHash()
	if err != nil {
		return nil, err
	}

	googleID := claims.Subject
	user := &model.User{
		Email:        email,
		Username:     username,
		DisplayName:  displayName,
		PasswordHash: unusableHash,
		IsActive:     true,
		GoogleID:     &googleID,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

// uniqueUsernameFromEmail derives a username from the email local-part,
// appending a short random suffix on collision. Replace with whatever
// uniqueness strategy your signup flow already uses if it differs.
func (s *authService) uniqueUsernameFromEmail(ctx context.Context, email string) (string, error) {
	base := strings.ToLower(strings.Split(email, "@")[0])

	for attempt := 0; attempt < 5; attempt++ {
		candidate := base
		if attempt > 0 {
			suffix, err := randomHex(3)
			if err != nil {
				return "", err
			}
			candidate = fmt.Sprintf("%s-%s", base, suffix)
		}

		exists, err := s.userRepo.ExistsByUsername(ctx, candidate)
		if err != nil {
			return "", err
		}
		if !exists {
			return candidate, nil
		}
	}
	return "", fmt.Errorf("could not generate a unique username for %s", email)
}

func randomUnusablePasswordHash() (string, error) {
	raw, err := randomHex(32)
	if err != nil {
		return "", err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(raw), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func randomHex(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (s *authService) GetUserByID(ctx context.Context, id string) (*UserResponse, error) {
	// Validate UUID format before hitting DB
	user, err := s.userRepo.FindByEmail(ctx, id)
	_ = user
	_ = err
	// (In a real app you'd parse the UUID and call FindByID)
	return nil, nil
}

func toUserResponse(u *model.User) *UserResponse {
	return &UserResponse{
		ID:        u.ID.String(),
		Email:     u.Email,
		Username:  u.Username,
		DisplayName: u.DisplayName,
	}
}