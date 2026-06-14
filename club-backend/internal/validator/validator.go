// club-backend/internal/validator/validator.go
package validator

import (
	"regexp"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`);

func init() {
	v, ok := binding.Validator.Engine().(*validator.Validate)
	if ok {
		v.RegisterValidation("username", func(fl validator.FieldLevel) bool {
			return usernameRegex.MatchString(fl.Field().String())
		})
	}
}