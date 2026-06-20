// cmd/api/main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"club-backend/internal/config"
	"club-backend/internal/handler"
	membershipclub "club-backend/internal/membership/club"
	"club-backend/internal/middleware"
	"club-backend/internal/repository"
	"club-backend/internal/service"
	studioclub "club-backend/internal/studio/club"
	_ "club-backend/internal/validator"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := gorm.Open(postgres.Open(cfg.Database.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := repository.AutoMigrate(db); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Extract *sql.DB from gorm for repositories that use database/sql directly.
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get underlying *sql.DB: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	authSvc := service.NewAuthService(userRepo, cfg.JWT)
	authHandler := handler.NewAuthHandler(authSvc)

	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	api := r.Group("/api/v1")
	authHandler.RegisterRoutes(api)

	protected := api.Group("/")
	protected.Use(middleware.Auth(cfg.JWT.Secret))
	protected.GET("/me", authHandler.Me)

	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Fatal(err)
	}
	defer logger.Sync()

	// ── Repositories ──────────────────────────────────────────────────────────
	studioClubRepo := studioclub.NewClubRepository(sqlDB)
	memberRepo      := membershipclub.NewMembershipRepository(sqlDB)

	// ── Routes ────────────────────────────────────────────────────────────────
	studio := api.Group("/studio")
	studio.Use(middleware.Auth(cfg.JWT.Secret))
	studio.GET("/club", studioclub.NewGetClub(studioClubRepo).Handler)
	studio.POST("/club",   studioclub.NewCreateClub(studioClubRepo).Handler)
	studio.PUT("/club/:id",   studioclub.NewUpdateClub(studioClubRepo).Handler)
	studio.DELETE("/club/:id", studioclub.NewDeleteClub(studioClubRepo).Handler)
	studio.POST("/club/:id/invite", studioclub.NewInviteClubMember(studioClubRepo).Handler)
	studio.GET("/club/:id", studioclub.NewGetClubById(studioClubRepo, logger).Handler)
	
	// ── Routes ────────────────────────────────────────────────────────────────
	mbr := api.Group("/membership")
	mbr.Use(middleware.OptionalAuth(cfg.JWT.Secret))
	mbr.GET(
		"/club",
		membershipclub.NewGetClubList(memberRepo, logger).Handler,
	)
	api.Group("/membership").Use(middleware.Auth(cfg.JWT.Secret)).POST("/club/:id/join",      membershipclub.NewJoinClub(memberRepo).Handler)
	api.Group("/membership").Use(middleware.Auth(cfg.JWT.Secret)).DELETE("/club/:id/leave",   membershipclub.NewLeaveClub(memberRepo).Handler)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	srv := &http.Server{
		Addr:         ":" + cfg.App.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("server listening on port %s", cfg.App.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("forced shutdown: %v", err)
	}
	log.Println("server stopped")
}