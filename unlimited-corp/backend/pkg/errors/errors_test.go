package errors

import (
	"errors"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAppError_Error(t *testing.T) {
	tests := []struct {
		name     string
		err      *AppError
		expected string
	}{
		{
			name:     "error with message only",
			err:      &AppError{Code: 400, Message: "bad request"},
			expected: "bad request",
		},
		{
			name:     "error with wrapped error",
			err:      &AppError{Code: 500, Message: "failed to process", Err: errors.New("connection refused")},
			expected: "failed to process: connection refused",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, tt.err.Error())
		})
	}
}

func TestAppError_Unwrap(t *testing.T) {
	originalErr := errors.New("original error")
	appErr := &AppError{
		Code:    500,
		Message: "wrapped",
		Err:     originalErr,
	}

	assert.Equal(t, originalErr, appErr.Unwrap())

	// Test unwrap with nil error
	nilErrAppErr := &AppError{Code: 400, Message: "no wrapped"}
	assert.Nil(t, nilErrAppErr.Unwrap())
}

func TestNew(t *testing.T) {
	err := New(403, "access denied")

	assert.Equal(t, 403, err.Code)
	assert.Equal(t, "access denied", err.Message)
	assert.Nil(t, err.Err)
}

func TestWrap(t *testing.T) {
	originalErr := errors.New("database connection failed")
	wrapped := Wrap(originalErr, "failed to create user")

	assert.Equal(t, http.StatusInternalServerError, wrapped.Code)
	assert.Equal(t, "failed to create user", wrapped.Message)
	assert.Equal(t, originalErr, wrapped.Err)
	assert.Contains(t, wrapped.Error(), "database connection failed")
}

func TestWrapWithCode(t *testing.T) {
	originalErr := errors.New("validation failed")
	wrapped := WrapWithCode(originalErr, http.StatusBadRequest, "invalid input")

	assert.Equal(t, http.StatusBadRequest, wrapped.Code)
	assert.Equal(t, "invalid input", wrapped.Message)
	assert.Equal(t, originalErr, wrapped.Err)
}

func TestIs(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		target   error
		expected bool
	}{
		{
			name:     "same error type and code",
			err:      &AppError{Code: 404, Message: "not found"},
			target:   ErrNotFound,
			expected: true,
		},
		{
			name:     "different code",
			err:      &AppError{Code: 400, Message: "bad request"},
			target:   ErrNotFound,
			expected: false,
		},
		{
			name:     "non-AppError",
			err:      errors.New("regular error"),
			target:   ErrNotFound,
			expected: false,
		},
		{
			name:     "target is non-AppError",
			err:      ErrNotFound,
			target:   errors.New("regular error"),
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.expected, Is(tt.err, tt.target))
		})
	}
}

func TestIsNotFound(t *testing.T) {
	assert.True(t, IsNotFound(ErrNotFound))
	assert.True(t, IsNotFound(&AppError{Code: 404, Message: "custom not found"}))
	assert.False(t, IsNotFound(ErrInvalidRequest))
}

func TestIsConflict(t *testing.T) {
	assert.True(t, IsConflict(ErrConflict))
	assert.True(t, IsConflict(&AppError{Code: 409, Message: "custom conflict"}))
	assert.False(t, IsConflict(ErrNotFound))
}

func TestIsUnauthorized(t *testing.T) {
	assert.True(t, IsUnauthorized(ErrForbidden))
	assert.False(t, IsUnauthorized(ErrUnauthorized)) // Note: IsUnauthorized checks for Forbidden
}

func TestIsBadRequest(t *testing.T) {
	assert.True(t, IsBadRequest(ErrInvalidRequest))
	assert.True(t, IsBadRequest(&AppError{Code: 400, Message: "validation error"}))
	assert.False(t, IsBadRequest(ErrNotFound))
}

func TestPredefinedErrors(t *testing.T) {
	tests := []struct {
		name    string
		err     *AppError
		code    int
		message string
	}{
		{"ErrInvalidRequest", ErrInvalidRequest, http.StatusBadRequest, "invalid request"},
		{"ErrUnauthorized", ErrUnauthorized, http.StatusUnauthorized, "unauthorized"},
		{"ErrForbidden", ErrForbidden, http.StatusForbidden, "forbidden"},
		{"ErrNotFound", ErrNotFound, http.StatusNotFound, "resource not found"},
		{"ErrConflict", ErrConflict, http.StatusConflict, "resource already exists"},
		{"ErrInternalServer", ErrInternalServer, http.StatusInternalServerError, "internal server error"},
		{"ErrInvalidCredential", ErrInvalidCredential, http.StatusUnauthorized, "invalid email or password"},
		{"ErrTokenExpired", ErrTokenExpired, http.StatusUnauthorized, "token expired"},
		{"ErrTokenInvalid", ErrTokenInvalid, http.StatusUnauthorized, "invalid token"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.code, tt.err.Code)
			assert.Equal(t, tt.message, tt.err.Message)
		})
	}
}

func TestAppError_ImplementsError(t *testing.T) {
	var _ error = &AppError{}
	// AppError implements error interface through Error() method
}
