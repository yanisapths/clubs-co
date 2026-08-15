package file

import "testing"

func TestPublicURL(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		assetBaseURL string
		objectPath   string
		want         string
	}{
		{
			name:         "falls back to GCS when asset base is empty",
			assetBaseURL: "",
			objectPath:   "club/banner/x.jpg",
			want:         "https://storage.googleapis.com/club-space-bucket/club/banner/x.jpg",
		},
		{
			name:         "uses CDN origin when configured",
			assetBaseURL: "https://asset-nonprd.meeteon.co",
			objectPath:   "club/banner/x.jpg",
			want:         "https://asset-nonprd.meeteon.co/club/banner/x.jpg",
		},
		{
			name:         "trims trailing slash on asset base",
			assetBaseURL: "https://asset-nonprd.meeteon.co/",
			objectPath:   "club/images/thumb.jpg",
			want:         "https://asset-nonprd.meeteon.co/club/images/thumb.jpg",
		},
		{
			name:         "normalises leading slash on object path",
			assetBaseURL: "https://asset-nonprd.meeteon.co",
			objectPath:   "/club/gallery/a.png",
			want:         "https://asset-nonprd.meeteon.co/club/gallery/a.png",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			svc := NewUploadService(nil, "proj", tt.assetBaseURL)
			if got := svc.publicURL(tt.objectPath); got != tt.want {
				t.Fatalf("publicURL(%q) = %q, want %q", tt.objectPath, got, tt.want)
			}
		})
	}
}

func TestObjectPathFromURL(t *testing.T) {
	t.Parallel()

	svc := NewUploadService(nil, "proj", "https://asset-nonprd.meeteon.co")

	tests := []struct {
		name    string
		url     string
		want    string
		wantErr bool
	}{
		{
			name: "parses legacy GCS URL",
			url:  "https://storage.googleapis.com/club-space-bucket/club/banner/x.jpg",
			want: "club/banner/x.jpg",
		},
		{
			name: "parses CDN URL",
			url:  "https://asset-nonprd.meeteon.co/club/banner/x.jpg",
			want: "club/banner/x.jpg",
		},
		{
			name:    "rejects unknown host",
			url:     "https://example.com/club/banner/x.jpg",
			wantErr: true,
		},
		{
			name:    "rejects CDN origin with no object path",
			url:     "https://asset-nonprd.meeteon.co/",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := svc.objectPathFromURL(tt.url)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("objectPathFromURL(%q) err = nil, want error", tt.url)
				}
				return
			}
			if err != nil {
				t.Fatalf("objectPathFromURL(%q) unexpected error: %v", tt.url, err)
			}
			if got != tt.want {
				t.Fatalf("objectPathFromURL(%q) = %q, want %q", tt.url, got, tt.want)
			}
		})
	}
}

func TestObjectPathFromURLWithoutAssetBase(t *testing.T) {
	t.Parallel()

	svc := NewUploadService(nil, "proj", "")
	got, err := svc.objectPathFromURL("https://storage.googleapis.com/club-space-bucket/club/temp/a.jpg")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != "club/temp/a.jpg" {
		t.Fatalf("got %q, want club/temp/a.jpg", got)
	}

	if _, err := svc.objectPathFromURL("https://asset-nonprd.meeteon.co/club/temp/a.jpg"); err == nil {
		t.Fatal("expected error parsing CDN URL when asset base is unset")
	}
}
