package user

import (
	"context"
	"testing"
	"time"

	"unlimited-corp/internal/domain/user"
	"unlimited-corp/pkg/jwt"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

// MockUserRepository 用户仓储Mock
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(ctx context.Context, u *user.User) error {
	args := m.Called(ctx, u)
	return args.Error(0)
}

func (m *MockUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*user.User), args.Error(1)
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*user.User), args.Error(1)
}

func (m *MockUserRepository) Update(ctx context.Context, u *user.User) error {
	args := m.Called(ctx, u)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	args := m.Called(ctx, email)
	return args.Bool(0), args.Error(1)
}

// 创建测试用的JWT Manager
func newTestJWTManager() *jwt.Manager {
	jwt.Init(&jwt.Config{
		Secret:           "test-secret-key-for-testing",
		ExpiresIn:        time.Hour,
		RefreshExpiresIn: 24 * time.Hour,
	})
	return jwt.GetManager()
}

func TestNewService(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()

	service := NewService(mockRepo, jwtManager)

	assert.NotNil(t, service)
	assert.NotNil(t, service.repo)
	assert.NotNil(t, service.jwtManager)
}

func TestService_Register_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()
	input := &RegisterInput{
		Email:    "newuser@example.com",
		Password: "password123",
		Nickname: "NewUser",
	}

	// Setup expectations
	mockRepo.On("ExistsByEmail", ctx, input.Email).Return(false, nil)
	mockRepo.On("Create", ctx, mock.AnythingOfType("*user.User")).Return(nil)

	// Execute
	output, err := service.Register(ctx, input)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, output)
	assert.NotNil(t, output.User)
	assert.Equal(t, input.Email, output.User.Email)
	assert.Equal(t, input.Nickname, output.User.Nickname)
	assert.NotNil(t, output.Token)
	assert.NotEmpty(t, output.Token.AccessToken)
	assert.NotEmpty(t, output.Token.RefreshToken)

	mockRepo.AssertExpectations(t)
}

func TestService_Register_EmailExists(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()
	input := &RegisterInput{
		Email:    "existing@example.com",
		Password: "password123",
		Nickname: "ExistingUser",
	}

	// Setup expectations - email already exists
	mockRepo.On("ExistsByEmail", ctx, input.Email).Return(true, nil)

	// Execute
	output, err := service.Register(ctx, input)

	// Assert
	assert.Error(t, err)
	assert.Nil(t, output)

	mockRepo.AssertExpectations(t)
}

func TestService_Login_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()

	// Create a user with known password
	existingUser, err := user.NewUser("test@example.com", "correctPassword", "TestUser")
	require.NoError(t, err)

	input := &LoginInput{
		Email:    "test@example.com",
		Password: "correctPassword",
	}

	// Setup expectations
	mockRepo.On("FindByEmail", ctx, input.Email).Return(existingUser, nil)

	// Execute
	output, err := service.Login(ctx, input)

	// Assert
	require.NoError(t, err)
	assert.NotNil(t, output)
	assert.Equal(t, existingUser.Email, output.User.Email)
	assert.NotNil(t, output.Token)
	assert.NotEmpty(t, output.Token.AccessToken)

	mockRepo.AssertExpectations(t)
}

func TestService_Login_WrongPassword(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()

	existingUser, _ := user.NewUser("test@example.com", "correctPassword", "TestUser")

	input := &LoginInput{
		Email:    "test@example.com",
		Password: "wrongPassword",
	}

	mockRepo.On("FindByEmail", ctx, input.Email).Return(existingUser, nil)

	output, err := service.Login(ctx, input)

	assert.Error(t, err)
	assert.Nil(t, output)
	mockRepo.AssertExpectations(t)
}

func TestService_Login_UserNotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()
	input := &LoginInput{
		Email:    "nonexistent@example.com",
		Password: "password",
	}

	mockRepo.On("FindByEmail", ctx, input.Email).Return(nil, nil)

	output, err := service.Login(ctx, input)

	assert.Error(t, err)
	assert.Nil(t, output)
	mockRepo.AssertExpectations(t)
}

func TestService_Login_InactiveUser(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()

	inactiveUser, _ := user.NewUser("inactive@example.com", "password", "InactiveUser")
	inactiveUser.Status = user.StatusInactive

	input := &LoginInput{
		Email:    "inactive@example.com",
		Password: "password",
	}

	mockRepo.On("FindByEmail", ctx, input.Email).Return(inactiveUser, nil)

	output, err := service.Login(ctx, input)

	assert.Error(t, err)
	assert.Nil(t, output)
	mockRepo.AssertExpectations(t)
}

func TestService_GetProfile_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()
	userID := uuid.New()
	existingUser := &user.User{
		ID:       userID,
		Email:    "test@example.com",
		Nickname: "TestUser",
		Status:   user.StatusActive,
	}

	mockRepo.On("FindByID", ctx, userID).Return(existingUser, nil)

	result, err := service.GetProfile(ctx, userID)

	require.NoError(t, err)
	assert.Equal(t, userID, result.ID)
	assert.Equal(t, "test@example.com", result.Email)
	mockRepo.AssertExpectations(t)
}

func TestService_GetProfile_NotFound(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()
	userID := uuid.New()

	mockRepo.On("FindByID", ctx, userID).Return(nil, nil)

	result, err := service.GetProfile(ctx, userID)

	assert.Error(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestService_UpdateProfile_Success(t *testing.T) {
	mockRepo := new(MockUserRepository)
	jwtManager := newTestJWTManager()
	service := NewService(mockRepo, jwtManager)

	ctx := context.Background()
	userID := uuid.New()
	existingUser := &user.User{
		ID:       userID,
		Email:    "test@example.com",
		Nickname: "OldNickname",
		Status:   user.StatusActive,
	}

	input := &UpdateProfileInput{
		Nickname:  "NewNickname",
		AvatarURL: "https://example.com/avatar.jpg",
	}

	mockRepo.On("FindByID", ctx, userID).Return(existingUser, nil)
	mockRepo.On("Update", ctx, mock.AnythingOfType("*user.User")).Return(nil)

	result, err := service.UpdateProfile(ctx, userID, input)

	require.NoError(t, err)
	assert.Equal(t, "NewNickname", result.Nickname)
	assert.Equal(t, "https://example.com/avatar.jpg", result.AvatarURL)
	mockRepo.AssertExpectations(t)
}
