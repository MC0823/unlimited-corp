package helpers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"unlimited-corp/pkg/errors"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestRespondError(t *testing.T) {
	tests := []struct {
		name     string
		code     int
		message  string
		expected int
	}{
		{
			name:     "bad request",
			code:     http.StatusBadRequest,
			message:  "invalid input",
			expected: http.StatusBadRequest,
		},
		{
			name:     "not found",
			code:     http.StatusNotFound,
			message:  "resource not found",
			expected: http.StatusNotFound,
		},
		{
			name:     "internal server error",
			code:     http.StatusInternalServerError,
			message:  "something went wrong",
			expected: http.StatusInternalServerError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			RespondError(c, tt.code, tt.message)

			assert.Equal(t, tt.expected, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			require.NoError(t, err)

			assert.Equal(t, float64(tt.code), response["code"])
			assert.Equal(t, tt.message, response["message"])
		})
	}
}

func TestRespondSuccess(t *testing.T) {
	tests := []struct {
		name string
		data interface{}
	}{
		{
			name: "string data",
			data: "hello",
		},
		{
			name: "map data",
			data: map[string]string{"key": "value"},
		},
		{
			name: "struct data",
			data: struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
			}{ID: 1, Name: "test"},
		},
		{
			name: "nil data",
			data: nil,
		},
		{
			name: "array data",
			data: []int{1, 2, 3},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			RespondSuccess(c, tt.data)

			assert.Equal(t, http.StatusOK, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			require.NoError(t, err)

			assert.Equal(t, float64(200), response["code"])
		})
	}
}

func TestHandleError(t *testing.T) {
	tests := []struct {
		name           string
		err            error
		expectedStatus int
		expectedMsg    string
	}{
		{
			name:           "not found error",
			err:            errors.ErrNotFound,
			expectedStatus: http.StatusNotFound,
			expectedMsg:    errors.ErrNotFound.Error(),
		},
		{
			name:           "conflict error",
			err:            errors.ErrConflict,
			expectedStatus: http.StatusConflict,
			expectedMsg:    errors.ErrConflict.Error(),
		},
		{
			name:           "unauthorized error",
			err:            errors.ErrForbidden,
			expectedStatus: http.StatusForbidden,
			expectedMsg:    errors.ErrForbidden.Error(),
		},
		{
			name:           "bad request error",
			err:            errors.ErrInvalidRequest,
			expectedStatus: http.StatusBadRequest,
			expectedMsg:    errors.ErrInvalidRequest.Error(),
		},
		{
			name:           "generic error",
			err:            errors.New(http.StatusInternalServerError, "unknown error"),
			expectedStatus: http.StatusInternalServerError,
			expectedMsg:    "internal server error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)

			HandleError(c, tt.err)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			require.NoError(t, err)
			assert.Equal(t, tt.expectedMsg, response["message"])
		})
	}
}

func TestHandleError_NilError(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	HandleError(c, nil)

	// No response should be written for nil error
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Empty(t, w.Body.Bytes())
}

func TestRespondError_ContentType(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondError(c, http.StatusBadRequest, "error")

	contentType := w.Header().Get("Content-Type")
	assert.Contains(t, contentType, "application/json")
}

func TestRespondSuccess_ContentType(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	RespondSuccess(c, map[string]string{"key": "value"})

	contentType := w.Header().Get("Content-Type")
	assert.Contains(t, contentType, "application/json")
}
