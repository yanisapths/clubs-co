// internal/studio/club/filename.go
package club

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ThumbnailFilename generates: club_[slug]_[clubID]_[uuid]_thumbnail.png
func ThumbnailFilename(clubName, clubID string) string {
	return fmt.Sprintf("club_%s_%s_%s_thumbnail.png",
		slugify(clubName),
		clubID,
		uuid.New().String(),
	)
}

var nonAlphanumRe = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = nonAlphanumRe.ReplaceAllString(s, "_")
	return strings.Trim(s, "_")
}

func GalleryFilename(clubName string, clubID int64, ext string) string {
	slug := slugify(clubName)
	if slug == "" {
		slug = "club"
	}
	ext = strings.TrimPrefix(strings.ToLower(ext), ".")
	if ext == "" {
		ext = "png"
	}
	return fmt.Sprintf("club_%s_%d_%s_gallery.%s", slug, clubID, uuid.NewString(), ext)
}

func BannerFilename(clubName string, clubID int64, ext string) string {
	return fmt.Sprintf("%s-%d-banner-%d.%s", toSlug(clubName), clubID, time.Now().UnixNano(), ext)
}