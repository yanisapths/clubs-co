// internal/config/config.go
package config

import (
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type AppConfig struct {
	Env  string
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

func (d DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		url.QueryEscape(d.User),
		url.QueryEscape(d.Password),
		d.Host,
		d.Port,
		d.Name,
		d.SSLMode,
	)
}

type JWTConfig struct {
	Secret          string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

func Load() (*Config, error) {
	v := viper.New()

	// Defaults
	v.SetDefault("app.env", "development")
	v.SetDefault("app.port", "8080")
	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", "5432")
	v.SetDefault("database.sslmode", "disable")
	v.SetDefault("jwt.access_token_ttl", "5h")
	v.SetDefault("jwt.refresh_token_ttl", "168h")


	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("./configs")

	v.SetEnvPrefix("")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("error reading config: %w", err)
		}
	}

	accessTTL, err := time.ParseDuration(v.GetString("jwt.access_token_ttl"))
	if err != nil {
		return nil, fmt.Errorf("invalid jwt.access_token_ttl: %w", err)
	}
	refreshTTL, err := time.ParseDuration(v.GetString("jwt.refresh_token_ttl"))
	if err != nil {
		return nil, fmt.Errorf("invalid jwt.refresh_token_ttl: %w", err)
	}

	cfg := &Config{
		App: AppConfig{
			Env:  v.GetString("app.env"),
			Port: v.GetString("app.port"),
		},
		Database: DatabaseConfig{
			Host:     v.GetString("database.host"),
			Port:     v.GetString("database.port"),
			User:     v.GetString("database.user"),
			Password: v.GetString("database.password"),
			Name:     v.GetString("database.name"),
			SSLMode:  v.GetString("database.sslmode"),
		},
		JWT: JWTConfig{
			Secret:          v.GetString("jwt.secret"),
			AccessTokenTTL:  accessTTL,
			RefreshTokenTTL: refreshTTL,
		},
	}

	if cfg.Database.User == "" || cfg.Database.Name == "" {
		return nil, fmt.Errorf(
			"database config incomplete — ensure config.yaml is in the project root or set DATABASE_USER / DATABASE_NAME env vars\nDSN would be: %s",
			cfg.Database.DSN(),
		)
	}

	return cfg, nil
}