package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"unlimited-corp/internal/infrastructure/config"
	"unlimited-corp/internal/infrastructure/temporal"
	"unlimited-corp/pkg/logger"

	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/worker"
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

	logger.Info("Starting Temporal Worker...")

	// 创建Temporal客户端
	c, err := client.Dial(client.Options{
		HostPort:  cfg.Temporal.Host,
		Namespace: cfg.Temporal.Namespace,
	})
	if err != nil {
		logger.Fatal(fmt.Sprintf("Failed to create Temporal client: %v", err))
	}
	defer c.Close()

	logger.Info("Temporal client connected")

	// 创建Worker
	w := worker.New(c, cfg.Temporal.TaskQueue, worker.Options{})

	// 注册工作流
	w.RegisterWorkflow(temporal.ContentCreationWorkflow)
	w.RegisterWorkflow(temporal.HotspotTrackingWorkflow)
	w.RegisterWorkflow(temporal.AutoOpsWorkflow)

	// 注册活动
	w.RegisterActivity(temporal.ExecuteSkillActivity)
	w.RegisterActivity(temporal.UpdateTaskStatusActivity)
	w.RegisterActivity(temporal.AnalyzeHotspotsActivity)
	w.RegisterActivity(temporal.GenerateContentSuggestionsActivity)
	w.RegisterActivity(temporal.PublishContentActivity)

	logger.Info(fmt.Sprintf("Worker registered with task queue: %s", cfg.Temporal.TaskQueue))

	// 启动Worker
	go func() {
		if err := w.Run(worker.InterruptCh()); err != nil {
			logger.Fatal(fmt.Sprintf("Worker failed: %v", err))
		}
	}()

	logger.Info("Temporal Worker started successfully")

	// 等待中断信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down worker...")
	w.Stop()
	logger.Info("Worker stopped")
}
