# ---------- Build Stage ----------
    FROM golang:1.22-alpine AS builder

    WORKDIR /app
    
    COPY go.mod go.sum ./
    RUN go mod download
    
    COPY . .
    
    RUN CGO_ENABLED=0 GOOS=linux go build \
        -ldflags="-s -w" \
        -o club-backend \
        ./cmd/api/main.go
    
    # ---------- Runtime Stage ----------
    FROM alpine:3.20
    
    RUN apk add --no-cache ca-certificates tzdata
    
    WORKDIR /app
    
    COPY --from=builder /app/club-backend .
    COPY config.yaml .
    
    EXPOSE 9090
    
    CMD ["./club-backend"]