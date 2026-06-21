package response

import (
	"errors"

	"github.com/gin-gonic/gin"
)

type Body struct {
	Code    int         `json:"code,omitempty"`
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

var (
	ErrSomethingWentWrong = errors.New("something went wrong")
)

func OK(c *gin.Context, data ...interface{}) {
	resp := Body{
		Code:    200,
		Success: true,
	}

	if len(data) > 0 {
		resp.Data = data[0]
	}

	c.JSON(200, resp)
}

func Created(c *gin.Context, data ...interface{}) {
	resp := Body{
		Code:    201,
		Success: true,
	}

	if len(data) > 0 {
		resp.Data = data[0]
	}

	c.JSON(201, resp)
}

func BadRequest(c *gin.Context, msg string) {
	c.JSON(400, Body{
		Code:    400,
		Success: false,
		Message: msg,
	})
}

func Unauthorized(c *gin.Context, msg string) {
	c.JSON(401, Body{
		Code:    401,
		Success: false,
		Message: msg,
	})
}

func Forbidden(c *gin.Context, msg string) {
	c.JSON(403, Body{
		Code:    403,
		Success: false,
		Message: msg,
	})
}

func NotFound(c *gin.Context, msg string) {
	c.JSON(404, Body{
		Code:    404,
		Success: false,
		Message: msg,
	})
}

func Conflict(c *gin.Context, msg string) {
	c.JSON(409, Body{
		Code:    409,
		Success: false,
		Message: msg,
	})
}

func InternalServerError(c *gin.Context, msg string) {
	c.JSON(500, Body{
		Code:    500,
		Success: false,
		Message: msg,
	})
}