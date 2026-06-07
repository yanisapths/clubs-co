.PHONY: run build test tidy lint fmt start-db stop-db db-logs create-db db-shell

APP_NAME=club-backend
MAIN=./cmd/api/main.go
DB_USER ?= postgres
DB_NAME ?= club_db
DB_PASSWORD ?= secret

ROOT_DIR := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))

## Run the server
run:
	cd $(ROOT_DIR) && set -a && . ./.env && set +a && go run $(MAIN)

## Build the binary
build:
	cd $(ROOT_DIR) && go build -o bin/$(APP_NAME) $(MAIN)

## Run all tests
test:
	go test -v -race ./...

## Tidy dependencies
tidy:
	go mod tidy

## Run golangci-lint
lint:
	golangci-lint run ./...

## Format source files
fmt:
	gofmt -w .

## Start local Postgres and ensure the database exists
start-db:
	docker compose up -d postgres
	@echo "Waiting for Postgres to be ready..."
	@until docker compose exec postgres pg_isready -U $(DB_USER) -q; do sleep 1; done
	@echo "Postgres is ready — creating database if it does not exist..."
	@docker compose exec -e PGPASSWORD=$(DB_PASSWORD) postgres psql -U $(DB_USER) -tc \
		"SELECT 1 FROM pg_database WHERE datname = '$(DB_NAME)'" \
		| grep -q 1 \
		|| docker compose exec -e PGPASSWORD=$(DB_PASSWORD) postgres createdb -U $(DB_USER) $(DB_NAME)
	@echo "Database '$(DB_NAME)' is ready — verifying..."
	@docker compose exec -e PGPASSWORD=$(DB_PASSWORD) postgres psql -U $(DB_USER) -l | grep $(DB_NAME)

## Create the database (idempotent)
create-db:
	@docker compose exec -e PGPASSWORD=$(DB_PASSWORD) postgres psql -U $(DB_USER) -tc \
		"SELECT 1 FROM pg_database WHERE datname = '$(DB_NAME)'" \
		| grep -q 1 \
		&& echo "Database '$(DB_NAME)' already exists" \
		|| (docker compose exec -e PGPASSWORD=$(DB_PASSWORD) postgres createdb -U $(DB_USER) $(DB_NAME) \
			&& echo "Database '$(DB_NAME)' created")

## Stop local Postgres
stop-db:
	docker compose stop postgres

## Tail Postgres logs
db-logs:
	docker compose logs -f postgres

## Open a psql shell inside the container
db-shell:
	docker compose exec -e PGPASSWORD=$(DB_PASSWORD) postgres psql -U $(DB_USER) -d $(DB_NAME)