package file

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"cloud.google.com/go/storage"
)

type UploadService struct {
	gcs       *storage.Client
	projectID string
}

func NewUploadService(gcs *storage.Client, projectID string) *UploadService {
	return &UploadService{gcs: gcs, projectID: projectID}
}

type UploadInput struct {
	File     io.ReadSeeker
	Filename string
	DestPath string
}

type UploadResult struct {
	URL      string
	Filename string
}

func (s *UploadService) Upload(ctx context.Context, input UploadInput) (*UploadResult, error) {
	// Validate MIME
	buf := make([]byte, 512)
	if _, err := input.File.Read(buf); err != nil {
		return nil, fmt.Errorf("read file: %w", err)
	}
	if mime := http.DetectContentType(buf); !strings.HasPrefix(mime, "image/") {
		return nil, fmt.Errorf("only image files are allowed")
	}
	if _, err := input.File.Seek(0, io.SeekStart); err != nil {
		return nil, fmt.Errorf("seek file: %w", err)
	}

	destPath := strings.Trim(input.DestPath, "/")
	objectPath := filepath.Join(destPath, input.Filename)

	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	wc := s.gcs.Bucket(bucketName).UserProject(s.projectID).Object(objectPath).NewWriter(ctx)
	wc.ContentType = "image/png"
	wc.CacheControl = "public, max-age=86400"

	if _, err := io.Copy(wc, input.File); err != nil {
		return nil, fmt.Errorf("stream to gcs: %w", err)
	}
	if err := wc.Close(); err != nil {
		return nil, fmt.Errorf("finalise gcs write: %w", err)
	}

	return &UploadResult{
		URL:      fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, objectPath),
		Filename: input.Filename,
	}, nil
}

func (s *UploadService) Delete(ctx context.Context, publicURL string) error {
	prefix := fmt.Sprintf("https://storage.googleapis.com/%s/", bucketName)
	objectPath := strings.TrimPrefix(publicURL, prefix)
	if objectPath == publicURL {
		return fmt.Errorf("unrecognised GCS URL: %s", publicURL)
	}

	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	return s.gcs.Bucket(bucketName).UserProject(s.projectID).Object(objectPath).Delete(ctx)
}