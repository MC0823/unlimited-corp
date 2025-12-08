package user

import (
	"context"

	"github.com/google/uuid"
	"unlimited-corp/internal/domain/user"
	"unlimited-corp/pkg/errors"
	"unlimited-corp/pkg/jwt"
)

// Service 用户服务
type Service struct {
	repo       user.Repository
	jwtManager *jwt.Manager
}

// NewService 创建用户服务
func NewService(repo user.Repository, jwtManager *jwt.Manager) *Service {
	return &Service{
		repo:       repo,
		jwtManager: jwtManager,
	}
}

// RegisterInput 注册输入
type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Nickname string `json:"nickname" binding:"required,min=2,max=50"`
}

// RegisterOutput 注册输出
type RegisterOutput struct {
	User  *user.User      `json:"user"`
	Token *jwt.TokenPair `json:"token"`
}

// Register 用户注册
func (s *Service) Register(ctx context.Context, input *RegisterInput) (*RegisterOutput, error) {
	// 检查邮箱是否已存在
	exists, err := s.repo.ExistsByEmail(ctx, input.Email)
	if err != nil {
		return nil, errors.Wrap(err, "failed to check email")
	}
	if exists {
		return nil, errors.ErrConflict
	}

	// 创建用户
	u, err := user.NewUser(input.Email, input.Password, input.Nickname)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create user")
	}

	// 保存用户
	if err := s.repo.Create(ctx, u); err != nil {
		return nil, errors.Wrap(err, "failed to save user")
	}

	// 生成Token
	tokenPair, err := s.jwtManager.GenerateTokenPair(u.ID, u.Email)
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate token")
	}

	return &RegisterOutput{
		User:  u,
		Token: tokenPair,
	}, nil
}

// LoginInput 登录输入
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginOutput 登录输出
type LoginOutput struct {
	User  *user.User      `json:"user"`
	Token *jwt.TokenPair `json:"token"`
}

// Login 用户登录
func (s *Service) Login(ctx context.Context, input *LoginInput) (*LoginOutput, error) {
	// 查找用户
	u, err := s.repo.FindByEmail(ctx, input.Email)
	if err != nil {
		return nil, errors.Wrap(err, "failed to find user")
	}
	if u == nil {
		return nil, errors.ErrInvalidCredential
	}

	// 验证密码
	if !u.ValidatePassword(input.Password) {
		return nil, errors.ErrInvalidCredential
	}

	// 检查用户状态
	if !u.IsActive() {
		return nil, errors.New(403, "user is not active")
	}

	// 生成Token
	tokenPair, err := s.jwtManager.GenerateTokenPair(u.ID, u.Email)
	if err != nil {
		return nil, errors.Wrap(err, "failed to generate token")
	}

	return &LoginOutput{
		User:  u,
		Token: tokenPair,
	}, nil
}

// RefreshTokenInput 刷新Token输入
type RefreshTokenInput struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// RefreshToken 刷新Token
func (s *Service) RefreshToken(ctx context.Context, input *RefreshTokenInput) (*jwt.TokenPair, error) {
	tokenPair, err := s.jwtManager.RefreshAccessToken(input.RefreshToken)
	if err != nil {
		return nil, errors.ErrTokenInvalid
	}

	return tokenPair, nil
}

// GetProfile 获取用户信息
func (s *Service) GetProfile(ctx context.Context, userID uuid.UUID) (*user.User, error) {
	u, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to find user")
	}
	if u == nil {
		return nil, errors.ErrNotFound
	}

	return u, nil
}

// UpdateProfileInput 更新资料输入
type UpdateProfileInput struct {
	Nickname  string `json:"nickname"`
	AvatarURL string `json:"avatar_url"`
}

// UpdateProfile 更新用户资料
func (s *Service) UpdateProfile(ctx context.Context, userID uuid.UUID, input *UpdateProfileInput) (*user.User, error) {
	u, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return nil, errors.Wrap(err, "failed to find user")
	}
	if u == nil {
		return nil, errors.ErrNotFound
	}

	u.UpdateProfile(input.Nickname, input.AvatarURL)

	if err := s.repo.Update(ctx, u); err != nil {
		return nil, errors.Wrap(err, "failed to update user")
	}

	return u, nil
}
