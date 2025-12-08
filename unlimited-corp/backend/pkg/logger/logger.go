package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"unlimited-corp/internal/infrastructure/config"
)

var log *zap.Logger
var sugar *zap.SugaredLogger

// Init 初始化日志
func Init(cfg *config.LogConfig) error {
	var level zapcore.Level
	if err := level.UnmarshalText([]byte(cfg.Level)); err != nil {
		level = zapcore.InfoLevel
	}

	var encoder zapcore.Encoder
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.TimeKey = "timestamp"
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder

	if cfg.Format == "console" {
		encoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		encoder = zapcore.NewConsoleEncoder(encoderConfig)
	} else {
		encoder = zapcore.NewJSONEncoder(encoderConfig)
	}

	core := zapcore.NewCore(
		encoder,
		zapcore.AddSync(os.Stdout),
		level,
	)

	log = zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))
	sugar = log.Sugar()

	return nil
}

// L 获取Logger
func L() *zap.Logger {
	return log
}

// S 获取SugaredLogger
func S() *zap.SugaredLogger {
	return sugar
}

// Info 记录信息日志
func Info(msg string, fields ...zap.Field) {
	log.Info(msg, fields...)
}

// Error 记录错误日志
func Error(msg string, fields ...zap.Field) {
	log.Error(msg, fields...)
}

// Debug 记录调试日志
func Debug(msg string, fields ...zap.Field) {
	log.Debug(msg, fields...)
}

// Warn 记录警告日志
func Warn(msg string, fields ...zap.Field) {
	log.Warn(msg, fields...)
}

// Fatal 记录致命日志并退出
func Fatal(msg string, fields ...zap.Field) {
	log.Fatal(msg, fields...)
}

// With 创建带字段的Logger
func With(fields ...zap.Field) *zap.Logger {
	return log.With(fields...)
}

// Sync 刷新日志缓冲区
func Sync() error {
	return log.Sync()
}
