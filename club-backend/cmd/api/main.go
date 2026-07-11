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
	"club-backend/internal/file"
	"club-backend/internal/handler"
	membershipclub "club-backend/internal/membership/club"
	membershipuser "club-backend/internal/membership/user"
	"club-backend/internal/middleware"
	"club-backend/internal/profile"
	"club-backend/internal/repository"
	"club-backend/internal/service"
	studioclub "club-backend/internal/studio/club"
	clubmember "club-backend/internal/studio/club/member"
	_ "club-backend/internal/validator"

	filePkg "club-backend/internal/file"

	"cloud.google.com/go/storage"
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

	gcsClient, err := storage.NewClient(context.Background())
	if err != nil {
		log.Fatalf("failed to create GCS client: %v", err)
	}
	defer gcsClient.Close()
	
	logger, err := zap.NewDevelopment()
	if err != nil {
		log.Fatal(err)
	}
	defer logger.Sync()


	userRepo := repository.NewUserRepository(db)
	authSvc := service.NewAuthService(userRepo, cfg.JWT)
	authHandler := handler.NewAuthHandler(authSvc, logger)

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

	uploadSvc := file.NewUploadService(gcsClient, cfg.GCP.ProjectID)

	fileGroup := api.Group("/file")
	fileGroup.Use(middleware.Auth(cfg.JWT.Secret))
	fileGroup.PUT("/upload", filePkg.NewUploadHandler(uploadSvc, logger).Handler)

	// ── Repositories ──────────────────────────────────────────────────────────
	studioClubRepo := studioclub.NewClubRepository(sqlDB, uploadSvc)
	studioClubMemberRepo := clubmember.NewMemberRepository(sqlDB)

	memberRepo      := membershipclub.NewMembershipRepository(sqlDB)
	profileRepo      := profile.NewProfileRepository(sqlDB, uploadSvc)
	memberUserRepo      := membershipuser.NewMembershipUserRepository(sqlDB)
	// ── Routes ────────────────────────────────────────────────────────────────
	studio := api.Group("/studio")
	studio.Use(middleware.Auth(cfg.JWT.Secret))
	{
		studio.GET("/club", studioclub.NewGetClub(studioClubRepo).Handler)
		studio.POST("/club",   studioclub.NewCreateClub(studioClubRepo, logger).Handler)
		studio.PUT("/club/:id",   studioclub.NewUpdateClub(studioClubRepo, uploadSvc, logger).Handler)
		studio.DELETE("/club/:id", studioclub.NewDeleteClub(studioClubRepo, logger).Handler)
		studio.GET("/club/:id", studioclub.NewGetClubById(studioClubRepo, logger).Handler)
		studio.PATCH("/club/:id", studioclub.NewPatchClub(studioClubRepo, uploadSvc, logger).Handler)
		studio.GET("/club/exist", studioclub.NewGetClubExist(studioClubRepo, logger).Handler)
		studio.GET("/club/:id/member", studioclub.NewGetClubMemberListById(studioClubRepo, logger).Handler)
		// clubmember
		studio.POST("/club/:id/member/invite", clubmember.NewInviteClubMember(studioClubMemberRepo, logger).Handler)
		studio.DELETE("/club/:id/member/:member_id/cancel-request", clubmember.NewCancelRequest(studioClubMemberRepo, logger).Handler)
		studio.DELETE("/club/:id/member/:member_id", clubmember.NewRemoveClubMember(studioClubMemberRepo, logger).Handler)
		studio.PATCH("/club/:id/member/:member_id/approve-request", clubmember.NewApproveMemberRequest(studioClubMemberRepo, logger).Handler)
	}

	profileApi := api.Group("/profile")
	profileApi.Use(middleware.Auth(cfg.JWT.Secret))
	{
		//view self profile
		profileApi.GET("",      profile.NewGetUserProfile(profileRepo).Handler)
		profileApi.PATCH("",    profile.NewUpdateUserProfile(profileRepo, uploadSvc,logger).Handler)
		profileApi.GET("/club", profile.NewGetUserClubs(profileRepo, logger).Handler)
		profileApi.DELETE("", profile.NewDeleteUser(profileRepo, uploadSvc, logger).Handler)
	}

	// ── Routes ────────────────────────────────────────────────────────────────
	mbr := api.Group("/membership")
	mbr.Use(middleware.OptionalAuth(cfg.JWT.Secret))
	mbr.GET(
		"/club",
		membershipclub.NewGetClubList(memberRepo, logger).Handler,
	)
	mbr.GET(
		"/club/list",
		membershipclub.NewGetClubListPaginated(memberRepo, logger).Handler,
	)
	api.Group("/membership").Use(middleware.Auth(cfg.JWT.Secret)).POST("/club/:id/join",      membershipclub.NewJoinClub(memberRepo,logger).Handler)
	api.Group("/membership").Use(middleware.Auth(cfg.JWT.Secret)).DELETE("/club/:id/leave",   membershipclub.NewLeaveClub(memberRepo,logger).Handler)
	api.Group("/membership").Use(middleware.Auth(cfg.JWT.Secret)).PATCH("/club/:id/invite/response",   membershipclub.NewInvitationResponse(memberRepo,logger).Handler)
	mbr.GET("/club/:club_name", membershipclub.NewGetClubInfo(memberRepo, logger).Handler)
	mbr.GET("/club/:club_name/member", membershipclub.NewGetClubMemberList(memberRepo, logger).Handler)
	mbr.GET("/search", membershipclub.NewSearchClubList(memberRepo, logger).Handler)
	mbr.GET("/club/category", membershipclub.NewGetClubCategoryList(memberRepo, logger).Handler)
	mbr.GET("/club/category/:category_slug", membershipclub.NewGetClubListByCategorySlug(memberRepo, logger).Handler)

	mbr.GET("/user/exist", membershipuser.NewGetUserExist(memberUserRepo, logger).Handler)

	//view other profile
	mbr.GET("/user/:username", membershipuser.NewGetPublicProfile(memberUserRepo, logger).Handler)
	mbr.GET("/user/:username/club", membershipuser.NewGetPublicUserClub(memberUserRepo, logger).Handler)

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