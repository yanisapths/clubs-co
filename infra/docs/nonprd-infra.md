Full stack at a glance
User (Thailand)
│
▼
Cloudflare DNS ← routes your domain subdomains
│
├──► Vercel ← Next.js frontend (nonprd.yourdomain.com)
│
├──► ALB :80/:443 ← load balancer (api-nonprd.yourdomain.com)
│ │
│ ▼
│ ECS Fargate ← Go backend container (ap-southeast-1)
│ │
│ ▼
│ Neon Postgres ← serverless database (free tier)
│
└──► CloudFront CDN ← image delivery (assets-nonprd.yourdomain.com)
│
▼
GCP Bucket ← club-space-bucket (existing)

Region question
You're in Thailand. The closest AWS region is ap-southeast-1 (Singapore) — about 50ms latency vs 250ms for us-east-1.
ServiceRegionWhyACM certus-east-1AWS hard requirement for CloudFrontCloudFrontglobalauto-distributedECS + ALB + ECRap-southeast-1closer to Thailand = fasterNeonap-southeast-1select on project creationVercelglobal edgeauto-distributed
For non-prod demo, us-east-1 works fine. Move ECS + ALB to Singapore when going prod.

All services
ServiceWhat it doesCostCloudflare DNSRoutes subdomains to each serviceFreeVercelHosts Next.js, auto-deploys on git pushFree tierACMWildcard SSL cert \*.yourdomain.comFreeALBStable HTTPS URL in front of ECS~$16/moECS FargateRuns your Go backend Docker container~$9/moECRDocker image registry (versioned)~$0.50/moNeon PostgresServerless database, scales to zeroFree tierCloudFront + GCP BucketCDN for image serving~$1/moTotal~$26/mo

Security groups (inbound rules only)
sg-club-alb-nonprd — the load balancer, faces the internet
PortProtocolSourceWhy80TCP0.0.0.0/0Redirect to HTTPS443TCP0.0.0.0/0HTTPS traffic from users
sg-club-backend-nonprd — your ECS container, never exposed publicly
PortProtocolSourceWhy9090TCPsg-club-alb-nonprdALB forwards requests here only

Build this infra — order of operations
[ ] 1. Cloudflare — buy domain via Cloudflare Registrar, enable DNS

[ ] 2. ACM (us-east-1) — request wildcard cert \*.yourdomain.com
Validate by adding CNAME record in Cloudflare

[ ] 3. CloudFront — create distribution
Origin: storage.googleapis.com/club-space-bucket
Attach ACM cert
→ Cloudflare CNAME: assets-nonprd.yourdomain.com → CloudFront URL

[ ] 4. Neon — create project (ap-southeast-1)
Run: pg_dump local | psql neon-url (schema migration)

[ ] 5. ECR — push your Docker image
docker build → docker tag → docker push

[ ] 6. ECS — create cluster (Express Mode, Fargate)
Create task definition (0.25 vCPU, 0.5GB, port 9090)
Set all env vars (DATABASE_URL, JWT_SECRET, GCP creds...)
Create service → launch type Fargate

[ ] 7. ALB — create Application Load Balancer
Listener :80 → redirect to HTTPS
Listener :443 → forward to ECS target group (port 9090)
Attach ACM cert to :443 listener
Target group health check: GET /health

[ ] 8. Cloudflare CNAME: api-nonprd.yourdomain.com → ALB DNS name
(set proxy OFF — orange cloud OFF for ALB)

[ ] 9. Vercel — connect GitHub repo, set env vars:
NEXT_PUBLIC_API_BASE_URL=https://api-nonprd.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api-nonprd.yourdomain.com
NEXT_PUBLIC_ASSET_BASE_URL=https://assets-nonprd.yourdomain.com
NEXTAUTH_SECRET=...

[ ] 10. Cloudflare CNAME: nonprd.yourdomain.com → Vercel CNAME

[ ] 11. Smoke test
curl https://api-nonprd.yourdomain.com/health
Open https://nonprd.yourdomain.com → login → upload image

Redeploy backend with a new version
Every time you change Go code:
bash# 1. Build with a version tag (never use :latest in prod)
docker build -t club-backend:v1.2.0 .

# 2. Push to ECR

docker tag club-backend:v1.2.0 <account>.dkr.ecr.ap-southeast-1.amazonaws.com/club-backend-nonprd:v1.0.0
docker push <account>.dkr.ecr.ap-southeast-1.amazonaws.com/club-backend-nonprd:v1.2.0

# 3. Update ECS task definition → point to :v1.2.0

# 4. Update ECS service → AWS drains old task, starts new one

# ALB health checks ensure zero-downtime swap

Frontend is automatic — just git push to main and Vercel deploys.

What to build next
Step 1 — deploy script (this week)
Replace the 4-step manual process with one command:
bash./deploy.sh v1.2.0
The script does: build → tag → push ECR → update ECS task def → update ECS service.
Step 2 — version tagging strategy
:v1.0.0 ← semver release
:sha-a3f9c2 ← git commit SHA (auto in CI)
:latest ← never deploy this to ECS, only for local testing
Step 3 — GitHub Actions pipeline
Trigger on push to main:
push to main
│
├── run tests
├── docker build + tag with git SHA
├── push to ECR
├── update ECS task definition
└── force new ECS service deployment
Vercel already handles the frontend pipeline automatically.
Step 4 — prod environment
Clone the entire nonprd stack with -prd names:

ECS: bump to 0.5 vCPU / 1GB, enable auto-scaling
ALB: add WAF basic rules (~$5/mo)
Neon: upgrade to paid plan for connection pooling
CloudFront: enable WAF
