package jwt

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// TokenType Token类型
type TokenType string

const (
	AccessToken  TokenType = "access"
	RefreshToken TokenType = "refresh"
)

// Claims JWT声明
type Claims struct {
	UserID    uuid.UUID `json:"user_id"`
	Email     string    `json:"email"`
	TokenType TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

// Config JWT配置
type Config struct {
	Secret           string
	ExpiresIn        time.Duration
	RefreshExpiresIn time.Duration
}

// Manager JWT管理器
type Manager struct {
	config *Config
}

var globalManager *Manager

// Init 初始化JWT管理器
func Init(config *Config) {
	globalManager = &Manager{config: config}
}

// GetManager 获取JWT管理器
func GetManager() *Manager {
	return globalManager
}

// TokenPair Token对
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

// GenerateTokenPair 生成Token对
func (m *Manager) GenerateTokenPair(userID uuid.UUID, email string) (*TokenPair, error) {
	// 生成Access Token
	accessToken, err := m.generateToken(userID, email, AccessToken, m.config.ExpiresIn)
	if err != nil {
		return nil, err
	}

	// 生成Refresh Token
	refreshToken, err := m.generateToken(userID, email, RefreshToken, m.config.RefreshExpiresIn)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(m.config.ExpiresIn.Seconds()),
	}, nil
}

// generateToken 生成Token
func (m *Manager) generateToken(userID uuid.UUID, email string, tokenType TokenType, expiration time.Duration) (string, error) {
	claims := &Claims{
		UserID:    userID,
		Email:     email,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "unlimited-corp",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(m.config.Secret))
}

// ValidateToken 验证Token
func (m *Manager) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(m.config.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// ValidateAccessToken 验证Access Token
func (m *Manager) ValidateAccessToken(tokenString string) (*Claims, error) {
	claims, err := m.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.TokenType != AccessToken {
		return nil, errors.New("invalid token type")
	}

	return claims, nil
}

// ValidateRefreshToken 验证Refresh Token
func (m *Manager) ValidateRefreshToken(tokenString string) (*Claims, error) {
	claims, err := m.ValidateToken(tokenString)
	if err != nil {
		return nil, err
	}

	if claims.TokenType != RefreshToken {
		return nil, errors.New("invalid token type")
	}

	return claims, nil
}

// RefreshAccessToken 刷新Access Token
func (m *Manager) RefreshAccessToken(refreshToken string) (*TokenPair, error) {
	claims, err := m.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}

	return m.GenerateTokenPair(claims.UserID, claims.Email)
}
