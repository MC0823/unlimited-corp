package http

import (
	chatApp "unlimited-corp/internal/application/chat"
	companyApp "unlimited-corp/internal/application/company"
	employeeApp "unlimited-corp/internal/application/employee"
	skillcardApp "unlimited-corp/internal/application/skillcard"
	taskApp "unlimited-corp/internal/application/task"
	userApp "unlimited-corp/internal/application/user"
	"unlimited-corp/internal/interfaces/http/api"
	"unlimited-corp/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

// Server HTTP服务器
type Server struct {
	engine           *gin.Engine
	userService      *userApp.Service
	companyService   *companyApp.Service
	skillCardService *skillcardApp.Service
	employeeService  *employeeApp.Service
	taskService      *taskApp.Service
	chatService      *chatApp.Service
}

// NewServer 创建HTTP服务器
func NewServer(userService *userApp.Service, companyService *companyApp.Service, skillCardService *skillcardApp.Service, employeeService *employeeApp.Service, taskService *taskApp.Service, chatService *chatApp.Service) *Server {
	return &Server{
		userService:      userService,
		companyService:   companyService,
		skillCardService: skillCardService,
		employeeService:  employeeService,
		taskService:      taskService,
		chatService:      chatService,
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
	s.engine.Use(middleware.RequestTracing()) // 链路追踪
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

	// 公司相关
	companyHandler := api.NewCompanyHandler(s.companyService)
	companyHandler.RegisterRoutes(apiV1)

	// 公司中间件
	companyMiddleware := middleware.CompanyRequired(s.companyService)

	// 技能卡相关
	skillCardHandler := api.NewSkillCardHandler(s.skillCardService)
	skillCardHandler.RegisterRoutes(apiV1, companyMiddleware)

	// 员工相关
	employeeHandler := api.NewEmployeeHandler(s.employeeService)
	employeeHandler.RegisterRoutes(apiV1, companyMiddleware)

	// 任务相关
	taskHandler := api.NewTaskHandler(s.taskService)
	taskHandler.RegisterRoutes(apiV1)

	// 对话相关
	chatHandler := api.NewChatHandler(s.chatService)
	chatHandler.RegisterRoutes(apiV1)

	return s.engine
}

// Engine 获取gin引擎
func (s *Server) Engine() *gin.Engine {
	return s.engine
}
