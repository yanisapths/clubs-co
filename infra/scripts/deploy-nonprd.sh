#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────
# Configuration — edit these once
# ─────────────────────────────────────────────
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
# ECS Express uses ARM64 by default; push both arch manifests to avoid CannotPullContainerError.
DOCKER_PLATFORMS="linux/amd64,linux/arm64"
ECR_REPO="club-backend-nonprd"
ECS_CLUSTER="default"
ECS_SERVICE="default-club-backend-nonprd-299f"
ECS_TASK_FAMILY="default-club-backend-nonprd-299f"
CONTAINER_NAME="Main"

# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}[ok]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
err()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

usage() {
  echo ""
  echo "  Usage: ./deploy-nonprd.sh <version>"
  echo ""
  echo "  Examples:"
  echo "    ./deploy-nonprd.sh v1.0.0"
  echo "    ./deploy-nonprd.sh v1.2.3"
  echo ""
  exit 1
}

# ─────────────────────────────────────────────
# Validate input
# ─────────────────────────────────────────────
VERSION="${1:-}"
if [[ -z "$VERSION" ]]; then
  err "Version argument is required."
  usage
fi

# Enforce vX.Y.Z format
if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  err "Version must be in format vX.Y.Z (e.g. v1.2.0). Got: $VERSION"
  usage
fi

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
IMAGE_URI="${ECR_URI}:${VERSION}"

echo ""
log "Starting deploy: ${VERSION}"
log "Image URI: ${IMAGE_URI}"
echo ""

# ─────────────────────────────────────────────
# Step 1 — ECR login
# ─────────────────────────────────────────────
log "Step 1/5 — Logging in to ECR..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ECR_URI"
ok "ECR login successful"

# ─────────────────────────────────────────────
# Step 2 — Docker build
# ─────────────────────────────────────────────
log "Step 2/5 — Building and pushing multi-arch image (${DOCKER_PLATFORMS})..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/../../club-backend"

BUILDER_NAME="club-backend-nonprd-builder"
if ! docker buildx inspect "${BUILDER_NAME}" >/dev/null 2>&1; then
  docker buildx create --name "${BUILDER_NAME}" --use
else
  docker buildx use "${BUILDER_NAME}"
fi

docker buildx build \
  --platform "${DOCKER_PLATFORMS}" \
  -t "${IMAGE_URI}" \
  --push \
  "$BACKEND_DIR"
ok "Pushed ${IMAGE_URI} (${DOCKER_PLATFORMS})"

# ─────────────────────────────────────────────
# Step 3 — Register new ECS task definition revision
# ─────────────────────────────────────────────
log "Step 3/5 — Registering new ECS task definition..."

# Fetch current task definition
CURRENT_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition "$ECS_TASK_FAMILY" \
  --region "$AWS_REGION" \
  --query "taskDefinition" \
  --output json)

# Build new task definition with updated image
NEW_TASK_DEF=$(echo "$CURRENT_TASK_DEF" | python3 -c "
import json, sys
td = json.load(sys.stdin)

# Update image in the target container
for c in td['containerDefinitions']:
    if c['name'] == '${CONTAINER_NAME}':
        c['image'] = '${IMAGE_URI}'
        break

# Remove fields that cannot be re-registered
for key in ['taskDefinitionArn','revision','status','requiresAttributes',
            'compatibilities','registeredAt','registeredBy']:
    td.pop(key, None)

print(json.dumps(td))
")

# Register the new revision
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --region "$AWS_REGION" \
  --cli-input-json "$NEW_TASK_DEF" \
  --query "taskDefinition.taskDefinitionArn" \
  --output text)

ok "New task definition: ${NEW_TASK_DEF_ARN}"

# ─────────────────────────────────────────────
# Step 4 — Update ECS service
# ─────────────────────────────────────────────
log "Step 4/5 — Updating ECS service..."

aws ecs update-service \
  --region "$AWS_REGION" \
  --cluster "$ECS_CLUSTER" \
  --service "$ECS_SERVICE" \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --force-new-deployment \
  --output json > /dev/null

ok "ECS service update triggered"

# ─────────────────────────────────────────────
# Wait for stability (optional, ~2-3 min)
# ─────────────────────────────────────────────
echo ""
log "Step 5/5 — Waiting for service to stabilize (this takes ~2-3 minutes)..."
aws ecs wait services-stable \
  --region "$AWS_REGION" \
  --cluster "$ECS_CLUSTER" \
  --services "$ECS_SERVICE"

echo ""
ok "Deploy complete! Version ${VERSION} is live."
echo ""
log "Running task definition: ${NEW_TASK_DEF_ARN}"
echo ""