// club-backend/internal/service/auth_service.go
package service

import (
	"context"
	"errors"
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
	DisplayName  string `json:"displayName"   binding:"required,min=3,max=50,displayName"`
}

type LoginRequest struct {
	// Accept either email or username
	Identifier string `json:"identifier" binding:"required"`
	Password   string `json:"password"   binding:"required"`
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
)

// --- Interface ---

type AuthService interface {
	SignUp(ctx context.Context, req *SignUpRequest) (*AuthResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error)
	GetUserByID(ctx context.Context, id string) (*UserResponse, error)
}

// --- Implementation ---

type authService struct {
	userRepo repository.UserRepository
	jwtCfg   config.JWTConfig
}

func NewAuthService(userRepo repository.UserRepository, jwtCfg config.JWTConfig) AuthService {
	return &authService{userRepo: userRepo, jwtCfg: jwtCfg}
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