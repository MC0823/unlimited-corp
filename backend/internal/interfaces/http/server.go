package http

import (
	"github.com/gin-gonic/gin"
	employeeApp "unlimited-corp/internal/application/employee"
	skillcardApp "unlimited-corp/internal/application/skillcard"
	userApp "unlimited-corp/internal/application/user"
	"unlimited-corp/internal/interfaces/http/api"
	"unlimited-corp/internal/interfaces/http/middleware"
)

// Server HTTP服务器
type Server struct {
	engine           *gin.Engine
	userService      *userApp.Service
	skillCardService *skillcardApp.Service
	employeeService  *employeeApp.Service
}

// NewServer 创建HTTP服务器
func NewServer(userService *userApp.Service, skillCardService *skillcardApp.Service, employeeService *employeeApp.Service) *Server {
	return &Server{
		userService:      userService,
		skillCardService: skillCardService,
		employeeService:  employeeService,
	}
}

// Setup 设置路由
func (s *Server) Setup(mode string) *gin.Engine {
	if mode == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	s.engine = gin.New()

	// 全局中间件
	s.engine.Use(middleware.Recovery())
	s.engine.Use(middleware.Logger())
	s.engine.Use(middleware.CORS())
	s.engine.Use(middleware.ErrorHandler())

	// API路由组
	apiV1 := s.engine.Group("/api/v1")

	// 健康检查
	healthHandler := api.NewHealthHandler()
	healthHandler.RegisterRoutes(apiV1)

	// 认证相关
	authHandler := api.NewAuthHandler(s.userService)
	authHandler.RegisterRoutes(apiV1)

	// 技能卡相关
	skillCardHandler := api.NewSkillCardHandler(s.skillCardService)
	skillCardHandler.RegisterRoutes(apiV1)

	// 员工相关
	employeeHandler := api.NewEmployeeHandler(s.employeeService)
	employeeHandler.RegisterRoutes(apiV1)

	return s.engine
}

// Engine 获取gin引擎
func (s *Server) Engine() *gin.Engine {
	return s.engine
}
