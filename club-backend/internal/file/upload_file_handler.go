package file

import (
	"club-backend/pkg/response"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

const (
	bucketName    = "club-space-bucket"
	maxUploadSize = 5 << 20 // 5 MB
)

type UploadHandler struct {
	svc *UploadService
	logger    *zap.Logger
}

func NewUploadHandler(svc *UploadService, logger *zap.Logger) *UploadHandler {
	return &UploadHandler{svc: svc,logger:logger}
}

// Handler PUT /file/upload
//
// Expects multipart/form-data:
//   - file      : image file (required)
//   - filename  : pre-built filename from the caller (required)
//   - dest_path : destination path inside the bucket, e.g. "club/images" (required)
//
// Returns: { "url": "...", "filename": "..." }
func (h *UploadHandler) Handler(c *gin.Context) {
	if err := c.Request.ParseMultipartForm(maxUploadSize); err != nil {
		response.BadRequest(c,"file too large or invalid form")
		return
	}

	filename := strings.TrimSpace(c.PostForm("filename"))
	if filename == "" {
		response.BadRequest(c, "filename is required")
		return
	}

	destPath := strings.TrimSpace(c.PostForm("dest_path"))
	if destPath == "" {
		response.BadRequest(c,  "dest_path is required")
		return
	}

	fh, _, err := c.Request.FormFile("file")
	if err != nil {
		response.BadRequest(c, "file is required")
		return
	}
	defer fh.Close()

	result, err := h.svc.Upload(c.Request.Context(), UploadInput{
		File:     fh,
		Filename: filename,
		DestPath: destPath,
	})
	if err != nil {
		if err.Error() == "only image files are allowed" {
			response.BadRequest(c, response.ErrSomethingWentWrong.Error())
			return
		}
		h.logger.Error("failed : Upload File",
			zap.Error(err),
			zap.String("path", c.Request.URL.Path),
			zap.String("method", c.Request.Method),
		)
		response.InternalServerError(c, response.ErrSomethingWentWrong.Error())
		return
	}

	response.OK(c, UploadFileResponse{
		Url:      result.URL,
	    Filename: result.Filename,
	})
}