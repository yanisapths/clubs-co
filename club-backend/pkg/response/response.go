package response

import "github.com/gin-gonic/gin"

type Body struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
}

type ErrorBody struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

func OK(c *gin.Context, data interface{}) {
	c.JSON(200, Body{Success: true, Data: data})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(201, Body{Success: true, Data: data})
}

func BadRequest(c *gin.Context, msg string) {
	c.JSON(400, ErrorBody{Success: false, Error: msg})
}

func Unauthorized(c *gin.Context, msg string) {
	c.JSON(401, ErrorBody{Success: false, Error: msg})
}

func Forbidden(c *gin.Context, msg string) {
	c.JSON(403, ErrorBody{Success: false, Error: msg})
}

func NotFound(c *gin.Context, msg string) {
	c.JSON(404, ErrorBody{Success: false, Error: msg})
}

func Conflict(c *gin.Context, msg string) {
	c.JSON(409, ErrorBody{Success: false, Error: msg})
}

func InternalError(c *gin.Context, msg string) {
	c.JSON(500, ErrorBody{Success: false, Error: msg})
}