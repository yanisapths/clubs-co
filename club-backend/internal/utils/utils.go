package utils

import "strings"

func IsUniqueViolation(err error) bool {
	if err == nil {
		return false
	}

	return strings.Contains(err.Error(), "SQLSTATE 23505")
}