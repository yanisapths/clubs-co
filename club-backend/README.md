# club-backend

Monolithic Go REST API following clean architecture principles.

## Project Structure

```
club-backend/
├── cmd/
│   └── api/
│       └── main.go            # Entry point: wires dependencies, starts HTTP server
├── internal/
│   ├── auth/
│   │   └── jwt.go             # JWT generation & parsing
│   ├── config/
│   │   └── config.go          # Viper-based config (file + env vars)
│   ├── handler/
│   │   └── auth_handler.go    # HTTP handlers (decode → call service → encode)
│   ├── middleware/
│   │   ├── auth.go            # Bearer token validation
│   │   └── middleware.go      # Logger + CORS
│   ├── model/
│   │   └── user.go            # GORM model (DB schema)
│   ├── repository/
│   │   └── user_repository.go # Data access layer (interface + GORM impl)
│   └── service/
│       └── auth_service.go    # Business logic, DTOs, error definitions
├── pkg/
│   └── response/
│       └── response.go        # Standardised JSON response helpers
├── config.yaml                # Local config (do NOT commit secrets)
├── docker-compose.yml
├── Dockerfile
└── Makefile
```

## Quick Start

```bash
# 1. Start Postgres
docker compose up -d postgres

# 2. Install dependencies
go mod tidy

# 3. Run the server
make run
```

## API Endpoints

| Method | Path                | Auth   | Description           |
| ------ | ------------------- | ------ | --------------------- |
| POST   | /api/v1/auth/signup | —      | Register a new user   |
| POST   | /api/v1/auth/login  | —      | Login, receive tokens |
| GET    | /api/v1/me          | Bearer | Get current user info |
| GET    | /health             | —      | Health check          |

### Sign Up

```json
POST /api/v1/auth/signup
{
  "email": "john@example.com",
  "username": "johndoe",
  "password": "supersecret",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login

```json
POST /api/v1/auth/login
{
  "identifier": "johndoe",   // email or username
  "password": "supersecret"
}
```

Response includes `access_token` and `refresh_token`.

## Environment Variables

All config keys map to env vars by replacing `.` with `_` (uppercase):

| Env Var             | Default     | Description                |
| ------------------- | ----------- | -------------------------- |
| `DATABASE_HOST`     | localhost   | Postgres host              |
| `DATABASE_PORT`     | 5432        | Postgres port              |
| `DATABASE_USER`     | —           | Postgres user              |
| `DATABASE_PASSWORD` | —           | Postgres password          |
| `DATABASE_NAME`     | —           | Database name              |
| `JWT_SECRET`        | —           | HS256 signing secret       |
| `APP_PORT`          | 8080        | HTTP listen port           |
| `APP_ENV`           | development | `development`/`production` |
