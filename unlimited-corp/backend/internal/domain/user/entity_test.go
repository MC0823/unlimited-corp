package user

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNewUser(t *testing.T) {
	tests := []struct {
		name     string
		email    string
		password string
		nickname string
		wantErr  bool
	}{
		{
			name:     "valid user creation",
			email:    "test@example.com",
			password: "password123",
			nickname: "TestUser",
			wantErr:  false,
		},
		{
			name:     "empty password should still hash",
			email:    "test@example.com",
			password: "",
			nickname: "TestUser",
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := NewUser(tt.email, tt.password, tt.nickname)

			if tt.wantErr {
				assert.Error(t, err)
				return
			}

			require.NoError(t, err)
			assert.NotEmpty(t, user.ID)
			assert.Equal(t, tt.email, user.Email)
			assert.Equal(t, tt.nickname, user.Nickname)
			assert.NotEmpty(t, user.PasswordHash)
			assert.NotEqual(t, tt.password, user.PasswordHash) // 确保密码已加密
			assert.Equal(t, StatusActive, user.Status)
			assert.False(t, user.CreatedAt.IsZero())
			assert.False(t, user.UpdatedAt.IsZero())
		})
	}
}

func TestUser_ValidatePassword(t *testing.T) {
	user, err := NewUser("test@example.com", "correctPassword", "TestUser")
	require.NoError(t, err)

	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{
			name:     "correct password",
			password: "correctPassword",
			want:     true,
		},
		{
			name:     "wrong password",
			password: "wrongPassword",
			want:     false,
		},
		{
			name:     "empty password",
			password: "",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := user.ValidatePassword(tt.password)
			assert.Equal(t, tt.want, result)
		})
	}
}

func TestUser_UpdatePassword(t *testing.T) {
	user, err := NewUser("test@example.com", "oldPassword", "TestUser")
	require.NoError(t, err)

	oldHash := user.PasswordHash
	oldUpdatedAt := user.UpdatedAt

	err = user.UpdatePassword("newPassword")
	require.NoError(t, err)

	assert.NotEqual(t, oldHash, user.PasswordHash)
	assert.True(t, user.ValidatePassword("newPassword"))
	assert.False(t, user.ValidatePassword("oldPassword"))
	assert.True(t, user.UpdatedAt.After(oldUpdatedAt) || user.UpdatedAt.Equal(oldUpdatedAt))
}

func TestUser_UpdateProfile(t *testing.T) {
	user, err := NewUser("test@example.com", "password", "OldNickname")
	require.NoError(t, err)

	user.AvatarURL = "old-avatar.jpg"
	oldUpdatedAt := user.UpdatedAt

	// Update both fields
	user.UpdateProfile("NewNickname", "new-avatar.jpg")

	assert.Equal(t, "NewNickname", user.Nickname)
	assert.Equal(t, "new-avatar.jpg", user.AvatarURL)
	assert.True(t, user.UpdatedAt.After(oldUpdatedAt) || user.UpdatedAt.Equal(oldUpdatedAt))

	// Update only nickname (empty avatar should not change)
	user.UpdateProfile("AnotherNickname", "")
	assert.Equal(t, "AnotherNickname", user.Nickname)
	assert.Equal(t, "new-avatar.jpg", user.AvatarURL) // 保持不变

	// Update only avatar (empty nickname should not change)
	user.UpdateProfile("", "another-avatar.jpg")
	assert.Equal(t, "AnotherNickname", user.Nickname) // 保持不变
	assert.Equal(t, "another-avatar.jpg", user.AvatarURL)
}

func TestUser_IsActive(t *testing.T) {
	user, err := NewUser("test@example.com", "password", "TestUser")
	require.NoError(t, err)

	// Default status should be active
	assert.True(t, user.IsActive())

	// Test inactive status
	user.Status = StatusInactive
	assert.False(t, user.IsActive())

	// Test banned status
	user.Status = StatusBanned
	assert.False(t, user.IsActive())

	// Back to active
	user.Status = StatusActive
	assert.True(t, user.IsActive())
}

func TestStatus_Values(t *testing.T) {
	assert.Equal(t, Status("active"), StatusActive)
	assert.Equal(t, Status("inactive"), StatusInactive)
	assert.Equal(t, Status("banned"), StatusBanned)
}
