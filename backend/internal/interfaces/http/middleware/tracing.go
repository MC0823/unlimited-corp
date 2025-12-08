package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	// RequestIDHeader 请求ID头
	RequestIDHeader = "X-Request-ID"
	// TraceIDHeader 链路追踪ID头
	TraceIDHeader = "X-Trace-ID"
	// RequestIDKey 上下文中的请求ID键
	RequestIDKey = "request_id"
	// TraceIDKey 上下文中的链路追踪ID键
	TraceIDKey = "trace_id"
)

// RequestTracing 请求链路追踪中间件
// 为每个请求生成唯一的RequestID和TraceID，支持分布式追踪
func RequestTracing() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取或生成 Request ID
		requestID := c.GetHeader(RequestIDHeader)
		if requestID == "" {
			requestID = generateID()
		}

		// 获取或生成 Trace ID（用于跨服务追踪）
		traceID := c.GetHeader(TraceIDHeader)
		if traceID == "" {
			traceID = generateID()
		}

		// 设置到上下文中，供后续处理使用
		c.Set(RequestIDKey, requestID)
		c.Set(TraceIDKey, traceID)

		// 设置响应头，方便客户端追踪
		c.Header(RequestIDHeader, requestID)
		c.Header(TraceIDHeader, traceID)

		c.Next()
	}
}

// GetRequestID 从上下文获取请求ID
func GetRequestID(c *gin.Context) string {
	if id, exists := c.Get(RequestIDKey); exists {
		return id.(string)
	}
	return ""
}

// GetTraceID 从上下文获取链路追踪ID
func GetTraceID(c *gin.Context) string {
	if id, exists := c.Get(TraceIDKey); exists {
		return id.(string)
	}
	return ""
}

// generateID 生成唯一ID
func generateID() string {
	return uuid.New().String()
}
