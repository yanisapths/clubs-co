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


// MoveObject promotes an object from one location in the bucket to another —
// e.g. from a "club/temp" staging path to its permanent "club/gallery" home —
// by issuing a server-side copy followed by a delete of the source object.
//
// GCS has no atomic rename, so this is a copy+delete. If the delete of the
// source fails after a successful copy, the destination object is still
// valid and the error is returned so the caller can log/retry cleanup of the
// now-orphaned temp object; the operation is NOT rolled back, since leaving
// a stale temp file around is far less harmful than losing the promoted copy.
func (s *UploadService) MoveObject(ctx context.Context, fromURL string, destPath string, destFilename string) (*UploadResult, error) {
	srcObjectPath, err := s.objectPathFromURL(fromURL)
	if err != nil {
		return nil, fmt.Errorf("parse source url: %w", err)
	}
 
	destPath = strings.Trim(destPath, "/")
	dstObjectPath := filepath.Join(destPath, destFilename)
 
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()
 
	bucket := s.gcs.Bucket(bucketName).UserProject(s.projectID)
	src := bucket.Object(srcObjectPath)
	dst := bucket.Object(dstObjectPath)
 
	copier := dst.CopierFrom(src)
	copier.ContentType = "image/png"
	copier.CacheControl = "public, max-age=86400"
 
	if _, err := copier.Run(ctx); err != nil {
		return nil, fmt.Errorf("copy %s -> %s: %w", srcObjectPath, dstObjectPath, err)
	}
 
	if err := src.Delete(ctx); err != nil {
		return &UploadResult{
				URL:      fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, dstObjectPath),
				Filename: destFilename,
			}, fmt.Errorf("copy succeeded but failed to delete source %s: %w", srcObjectPath, err)
	}
 
	return &UploadResult{
		URL:      fmt.Sprintf("https://storage.googleapis.com/%s/%s", bucketName, dstObjectPath),
		Filename: destFilename,
	}, nil
}
 
func (s *UploadService) objectPathFromURL(publicURL string) (string, error) {
	prefix := fmt.Sprintf("https://storage.googleapis.com/%s/", bucketName)
	objectPath := strings.TrimPrefix(publicURL, prefix)
	if objectPath == publicURL {
		return "", fmt.Errorf("unrecognised GCS URL: %s", publicURL)
	}
	return objectPath, nil
}