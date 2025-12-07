package errors

import (
	"fmt"
	"net/http"
)

// AppError 应用错误
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Err     error  `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

// Unwrap 返回原始错误
func (e *AppError) Unwrap() error {
	return e.Err
}

// 预定义错误
var (
	ErrInvalidRequest    = &AppError{Code: http.StatusBadRequest, Message: "invalid request"}
	ErrUnauthorized      = &AppError{Code: http.StatusUnauthorized, Message: "unauthorized"}
	ErrForbidden         = &AppError{Code: http.StatusForbidden, Message: "forbidden"}
	ErrNotFound          = &AppError{Code: http.StatusNotFound, Message: "resource not found"}
	ErrConflict          = &AppError{Code: http.StatusConflict, Message: "resource already exists"}
	ErrInternalServer    = &AppError{Code: http.StatusInternalServerError, Message: "internal server error"}
	ErrInvalidCredential = &AppError{Code: http.StatusUnauthorized, Message: "invalid email or password"}
	ErrTokenExpired      = &AppError{Code: http.StatusUnauthorized, Message: "token expired"}
	ErrTokenInvalid      = &AppError{Code: http.StatusUnauthorized, Message: "invalid token"}
)

// New 创建新错误
func New(code int, message string) *AppError {
	return &AppError{Code: code, Message: message}
}

// Wrap 包装错误
func Wrap(err error, message string) *AppError {
	return &AppError{
		Code:    http.StatusInternalServerError,
		Message: message,
		Err:     err,
	}
}

// WrapWithCode 带状态码包装错误
func WrapWithCode(err error, code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// Is 检查是否为特定错误
func Is(err, target error) bool {
	if e, ok := err.(*AppError); ok {
		if t, ok := target.(*AppError); ok {
			return e.Code == t.Code
		}
	}
	return false
}

// IsNotFound 检查是否为404错误
func IsNotFound(err error) bool {
	return Is(err, ErrNotFound)
}

// IsConflict 检查是否为409错误
func IsConflict(err error) bool {
	return Is(err, ErrConflict)
}

// IsUnauthorized 检查是否为403错误
func IsUnauthorized(err error) bool {
	return Is(err, ErrForbidden)
}

// IsBadRequest 检查是否为400错误
func IsBadRequest(err error) bool {
	return Is(err, ErrInvalidRequest)
}
