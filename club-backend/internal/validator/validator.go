package validator

import (
	"regexp"

	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
)

var (
	usernameRegex    = regexp.MustCompile(`^[^\s"<>?=+%]+$`)
	displayNameRegex = regexp.MustCompile(`^[^"<>?=+%]+$`)
)

func init() {
	v, ok := binding.Validator.Engine().(*validator.Validate)
	if !ok {
		return
	}

	v.RegisterValidation("username", func(fl validator.FieldLevel) bool {
		return usernameRegex.MatchString(fl.Field().String())
	})

	v.RegisterValidation("displayName", func(fl validator.FieldLevel) bool {
		return displayNameRegex.MatchString(fl.Field().String())
	})
}