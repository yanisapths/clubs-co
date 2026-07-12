# ─────────────────────────────────────────────────────────────────
# Club — project root Makefile
# Usage: make <target> [version=vX.Y.Z]
# ─────────────────────────────────────────────────────────────────

SCRIPTS_DIR := scripts       
BACKEND_DIR := ../club-backend  
WEB_DIR     := ../club-web

# Read version from argument, default to prompt
VERSION ?= $(version)

.DEFAULT_GOAL := help

# ─────────────────────────────────────────────────────────────────
# Help
# ─────────────────────────────────────────────────────────────────
.PHONY: help
help:
	@echo ""
	@echo "  Usage: make <target> [version=vX.Y.Z]"
	@echo ""
	@echo "  Deploy"
	@echo "    make deploy version=v1.2.0     Deploy backend to nonprd"
	@echo ""
	@echo "  Backend (club-backend/)"
	@echo "    make build                     Docker build only (no push)"
	@echo "    make run                       Run backend locally"
	@echo "    make test                      Run Go tests"
	@echo "    make lint                      Run Go linter"
	@echo ""
	@echo "  Web (club-web/)"
	@echo "    make web-dev                   Start Next.js dev server"
	@echo "    make web-build                 Build Next.js for production"
	@echo "    make web-lint                  Run Next.js linter"
	@echo ""
	@echo "  Infra"
	@echo "    make db-migrate                Dump local schema → Neon"
	@echo "    make ecr-login                 Login to ECR"
	@echo ""

# ─────────────────────────────────────────────────────────────────
# Deploy
# ─────────────────────────────────────────────────────────────────
.PHONY: deploy
deploy:
	@if [ -z "$(VERSION)" ]; then \
		echo ""; \
		echo "  Error: version is required."; \
		echo "  Usage: make deploy version=v1.2.0"; \
		echo ""; \
		exit 1; \
	fi
	@bash $(SCRIPTS_DIR)/deploy-nonprd.sh $(VERSION)

# ─────────────────────────────────────────────────────────────────
# Backend
# ─────────────────────────────────────────────────────────────────
.PHONY: build
build:
	docker build --platform linux/amd64 -t club-backend:local $(BACKEND_DIR)

.PHONY: run
run:
	cd $(BACKEND_DIR) && go run ./cmd/api

.PHONY: test
test:
	cd $(BACKEND_DIR) && go test ./...

.PHONY: lint
lint:
	cd $(BACKEND_DIR) && golangci-lint run ./...

# ─────────────────────────────────────────────────────────────────
# Web
# ─────────────────────────────────────────────────────────────────
.PHONY: web-dev
web-dev:
	cd $(WEB_DIR) && npm run dev

.PHONY: web-build
web-build:
	cd $(WEB_DIR) && npm run build

.PHONY: web-lint
web-lint:
	cd $(WEB_DIR) && npm run lint

# ─────────────────────────────────────────────────────────────────
# Infra / DB
# ─────────────────────────────────────────────────────────────────
.PHONY: db-migrate
db-migrate:
	@if [ -z "$(NEON_URL)" ]; then \
		echo "  Error: NEON_URL is not set."; \
		echo "  Usage: make db-migrate NEON_URL=postgresql://..."; \
		exit 1; \
	fi
	/opt/homebrew/opt/postgresql@16/bin/pg_dump \
		-h localhost -U postgres -d club_db \
		--schema-only --no-owner --no-acl \
		| psql "$(NEON_URL)"

.PHONY: ecr-login
ecr-login:
	aws ecr get-login-password --region ap-southeast-1 \
		| docker login --username AWS --password-stdin \
		$$(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-southeast-1.amazonaws.com