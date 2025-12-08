package jwt

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestManager() *Manager {
	config := &Config{
		Secret:           "test-secret-key-for-testing",
		ExpiresIn:        time.Hour,
		RefreshExpiresIn: 24 * time.Hour,
	}
	Init(config)
	return GetManager()
}

func TestInit(t *testing.T) {
	config := &Config{
		Secret:           "test-secret",
		ExpiresIn:        time.Hour,
		RefreshExpiresIn: 24 * time.Hour,
	}

	Init(config)

	manager := GetManager()
	assert.NotNil(t, manager)
	assert.NotNil(t, manager.config)
	assert.Equal(t, "test-secret", manager.config.Secret)
}

func TestGetManager(t *testing.T) {
	setupTestManager()

	manager := GetManager()
	assert.NotNil(t, manager)
}

func TestManager_GenerateTokenPair(t *testing.T) {
	manager := setupTestManager()
	userID := uuid.New()
	email := "test@example.com"

	tokenPair, err := manager.GenerateTokenPair(userID, email)

	require.NoError(t, err)
	assert.NotEmpty(t, tokenPair.AccessToken)
	assert.NotEmpty(t, tokenPair.RefreshToken)
	assert.Greater(t, tokenPair.ExpiresIn, int64(0))
}

func TestManager_ValidateToken(t *testing.T) {
	manager := setupTestManager()
	userID := uuid.New()
	email := "test@example.com"

	tokenPair, err := manager.GenerateTokenPair(userID, email)
	require.NoError(t, err)

	claims, err := manager.ValidateToken(tokenPair.AccessToken)
	require.NoError(t, err)
	assert.Equal(t, userID, claims.UserID)
	assert.Equal(t, email, claims.Email)
	assert.Equal(t, AccessToken, claims.TokenType)
}

func TestManager_ValidateToken_Invalid(t *testing.T) {
	manager := setupTestManager()

	claims, err := manager.ValidateToken("invalid-token")

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestManager_ValidateToken_WrongSecret(t *testing.T) {
	manager := setupTestManager()
	userID := uuid.New()

	// Generate with one secret
	tokenPair, err := manager.GenerateTokenPair(userID, "test@example.com")
	require.NoError(t, err)

	// Change to different secret
	Init(&Config{
		Secret:           "different-secret",
		ExpiresIn:        time.Hour,
		RefreshExpiresIn: 24 * time.Hour,
	})
	newManager := GetManager()

	// Validate should fail
	claims, err := newManager.ValidateToken(tokenPair.AccessToken)
	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestManager_ValidateAccessToken(t *testing.T) {
	manager := setupTestManager()
	userID := uuid.New()
	email := "test@example.com"

	tokenPair, err := manager.GenerateTokenPair(userID, email)
	require.NoError(t, err)

	// Access token should be valid
	claims, err := manager.ValidateAccessToken(tokenPair.AccessToken)
	require.NoError(t, err)
	assert.Equal(t, AccessToken, claims.TokenType)

	// Refresh token should be invalid as access token
	claims, err = manager.ValidateAccessToken(tokenPair.RefreshToken)
	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestManager_ValidateRefreshToken(t *testing.T) {
	manager := setupTestManager()
	userID := uuid.New()
	email := "test@example.com"

	tokenPair, err := manager.GenerateTokenPair(userID, email)
	require.NoError(t, err)

	// Refresh token should be valid
	claims, err := manager.ValidateRefreshToken(tokenPair.RefreshToken)
	require.NoError(t, err)
	assert.Equal(t, RefreshToken, claims.TokenType)

	// Access token should be invalid as refresh token
	claims, err = manager.ValidateRefreshToken(tokenPair.AccessToken)
	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestManager_RefreshAccessToken(t *testing.T) {
	manager := setupTestManager()
	userID := uuid.New()
	email := "test@example.com"

	originalPair, err := manager.GenerateTokenPair(userID, email)
	require.NoError(t, err)

	// Wait a tiny bit to ensure different timestamps
	time.Sleep(10 * time.Millisecond)

	// Refresh the token
	newPair, err := manager.RefreshAccessToken(originalPair.RefreshToken)
	require.NoError(t, err)

	// New tokens should exist
	assert.NotEmpty(t, newPair.AccessToken)
	assert.NotEmpty(t, newPair.RefreshToken)

	// New access token should be valid
	claims, err := manager.ValidateAccessToken(newPair.AccessToken)
	require.NoError(t, err)
	assert.Equal(t, userID, claims.UserID)
	assert.Equal(t, email, claims.Email)
}

func TestManager_RefreshAccessToken_InvalidToken(t *testing.T) {
	manager := setupTestManager()

	newPair, err := manager.RefreshAccessToken("invalid-token")

	assert.Error(t, err)
	assert.Nil(t, newPair)
}

func TestManager_RefreshAccessToken_WithAccessToken(t *testing.T) {
	manager := setupTestManager()
	userID := uuid.New()

	tokenPair, err := manager.GenerateTokenPair(userID, "test@example.com")
	require.NoError(t, err)

	// Using access token instead of refresh token should fail
	newPair, err := manager.RefreshAccessToken(tokenPair.AccessToken)

	assert.Error(t, err)
	assert.Nil(t, newPair)
}

func TestTokenType_Constants(t *testing.T) {
	assert.Equal(t, TokenType("access"), AccessToken)
	assert.Equal(t, TokenType("refresh"), RefreshToken)
}

func TestClaims_Structure(t *testing.T) {
	manager := setupTestManager()
	userID := uuid.New()
	email := "test@example.com"

	tokenPair, err := manager.GenerateTokenPair(userID, email)
	require.NoError(t, err)

	claims, err := manager.ValidateToken(tokenPair.AccessToken)
	require.NoError(t, err)

	// Check all fields are populated
	assert.Equal(t, userID, claims.UserID)
	assert.Equal(t, email, claims.Email)
	assert.Equal(t, AccessToken, claims.TokenType)
	assert.Equal(t, "unlimited-corp", claims.Issuer)
	assert.NotNil(t, claims.ExpiresAt)
	assert.NotNil(t, claims.IssuedAt)
	assert.NotNil(t, claims.NotBefore)
}
