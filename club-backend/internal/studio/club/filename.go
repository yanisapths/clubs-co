// internal/studio/club/filename.go
package club

import (
	"fmt"
	"regexp"
	"strings"

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