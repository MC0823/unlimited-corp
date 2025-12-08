package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	chatApp "unlimited-corp/internal/application/chat"
	companyApp "unlimited-corp/internal/application/company"
	employeeApp "unlimited-corp/internal/application/employee"
	skillcardApp "unlimited-corp/internal/application/skillcard"
	taskApp "unlimited-corp/internal/application/task"
	userApp "unlimited-corp/internal/application/user"
	"unlimited-corp/internal/infrastructure/cache"
	"unlimited-corp/internal/infrastructure/config"
	"unlimited-corp/internal/infrastructure/database"
	"unlimited-corp/internal/infrastructure/persistence"
	httpServer "unlimited-corp/internal/interfaces/http"
	"unlimited-corp/pkg/jwt"
	"unlimited-corp/pkg/logger"
)

func main() {
	// 加载配置
	cfg, err := config.Load("configs/config.yaml")
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}

	// 初始化日志
	if err := logger.Init(&cfg.Log); err != nil {
		fmt.Printf("Failed to init logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.Sync()

	logger.Info("Starting Unlimited Corp server...")

	// 连接数据库
	db, err := database.Connect(&cfg.Database)
	if err != nil {
		logger.Fatal(fmt.Sprintf("Failed to connect database: %v", err))
	}
	defer db.Close()
	logger.Info("Database connected")

	// 连接Redis
	redis, err := cache.Connect(&cfg.Redis)
	if err != nil {
		logger.Warn(fmt.Sprintf("Failed to connect redis: %v (continuing without cache)", err))
	} else {
		defer redis.Close()
		logger.Info("Redis connected")
	}

	// 初始化JWT
	jwt.Init(&jwt.Config{
		Secret:           cfg.JWT.Secret,
		ExpiresIn:        cfg.JWT.ExpiresIn,
		RefreshExpiresIn: cfg.JWT.RefreshExpiresIn,
	})
	logger.Info("JWT initialized")

	// 初始化仓储
	userRepo := persistence.NewUserRepository(db)
	companyRepo := persistence.NewCompanyRepository(db.DB)
	skillCardRepo := persistence.NewSkillCardRepository(db)
	employeeRepo := persistence.NewEmployeeRepository(db)
	taskRepo := persistence.NewTaskRepository(db.DB)
	chatRepo := persistence.NewChatRepository(db.DB)

	// 初始化服务
	userService := userApp.NewService(userRepo, jwt.GetManager())
	companyService := companyApp.NewService(companyRepo)
	skillCardService := skillcardApp.NewService(skillCardRepo)
	employeeService := employeeApp.NewService(employeeRepo)
	taskService := taskApp.NewService(taskRepo)
	chatService := chatApp.NewService(chatRepo, chatRepo)

	// 创建HTTP服务器
	server := httpServer.NewServer(userService, companyService, skillCardService, employeeService, taskService, chatService)
	engine := server.Setup(cfg.App.Mode)

	// 启动服务器
	addr := fmt.Sprintf(":%d", cfg.App.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: engine,
	}

	// 优雅关闭
	go func() {
		logger.Info(fmt.Sprintf("Server starting on %s", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal(fmt.Sprintf("Failed to start server: %v", err))
		}
	}()

	// 等待中断信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// 设置5秒超时
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Fatal(fmt.Sprintf("Server forced to shutdown: %v", err))
	}

	logger.Info("Server exited")
}
