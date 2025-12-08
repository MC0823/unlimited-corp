# 《无限公司 Unlimited Corp.》API规格文档

## 文档信息
| 项目 | 内容 |
|------|------|
| API版本 | v1 |
| 基础路径 | `https://api.unlimited-corp.com/api/v1` |
| 认证方式 | Bearer Token (JWT) |
| 内容类型 | application/json |

---

## 1. 通用规范

### 1.1 请求头

```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Request-ID: <uuid>           # 可选，用于请求追踪
X-Device-ID: <device_id>       # 可选，设备标识
```

### 1.2 统一响应格式

#### 成功响应
```json
{
    "code": 0,
    "message": "success",
    "data": { ... },
    "timestamp": 1699200000000,
    "requestId": "req-uuid-xxx"
}
```

#### 错误响应
```json
{
    "code": 40001,
    "message": "Invalid parameter: email format incorrect",
    "data": null,
    "errors": [
        {
            "field": "email",
            "message": "must be a valid email address"
        }
    ],
    "timestamp": 1699200000000,
    "requestId": "req-uuid-xxx"
}
```

#### 分页响应
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [...],
        "pagination": {
            "page": 1,
            "pageSize": 20,
            "total": 100,
            "totalPages": 5,
            "hasNext": true,
            "hasPrev": false
        }
    },
    "timestamp": 1699200000000
}
```

### 1.3 错误码定义

| 错误码 | 含义 | HTTP状态码 |
|--------|------|------------|
| 0 | 成功 | 200 |
| 40001 | 参数错误 | 400 |
| 40002 | 参数格式错误 | 400 |
| 40101 | 未认证 | 401 |
| 40102 | Token过期 | 401 |
| 40301 | 无权限 | 403 |
| 40302 | 订阅等级不足 | 403 |
| 40401 | 资源不存在 | 404 |
| 40901 | 资源冲突 | 409 |
| 42201 | 业务规则冲突 | 422 |
| 42901 | 请求过于频繁 | 429 |
| 50001 | 服务器内部错误 | 500 |
| 50301 | 服务不可用 | 503 |

---

## 2. 认证模块 (Auth)

### 2.1 用户注册

```
POST /auth/register
```

**请求体**
```json
{
    "email": "user@example.com",
    "password": "securePassword123",
    "nickname": "我的公司",
    "inviteCode": "INVITE123"    // 可选，邀请码
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "userId": "usr_abc123",
        "email": "user@example.com",
        "nickname": "我的公司",
        "company": {
            "companyId": "cmp_xyz789",
            "name": "我的公司",
            "createdAt": "2024-10-01T10:00:00Z"
        },
        "subscription": {
            "planType": "free",
            "maxEmployees": 5,
            "maxSkillCards": 10
        },
        "tokens": {
            "accessToken": "eyJhbGciOiJSUzI1NiIs...",
            "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
            "expiresIn": 7200
        }
    }
}
```

**响应 - 邮箱已存在 (409)**
```json
{
    "code": 40901,
    "message": "Email already registered",
    "data": null
}
```

---

### 2.2 用户登录

```
POST /auth/login
```

**请求体**
```json
{
    "email": "user@example.com",
    "password": "securePassword123",
    "deviceInfo": {
        "deviceId": "device_abc",
        "deviceType": "web",        // web | desktop | ios | android
        "deviceName": "Chrome on Windows"
    }
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "userId": "usr_abc123",
        "email": "user@example.com",
        "nickname": "我的公司",
        "avatarUrl": "https://cdn.example.com/avatars/xxx.jpg",
        "company": {
            "companyId": "cmp_xyz789",
            "name": "我的公司"
        },
        "subscription": {
            "planType": "professional",
            "maxEmployees": 20,
            "maxSkillCards": 50,
            "expiresAt": "2025-10-01T00:00:00Z"
        },
        "tokens": {
            "accessToken": "eyJhbGciOiJSUzI1NiIs...",
            "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
            "expiresIn": 7200
        }
    }
}
```

---

### 2.3 刷新Token

```
POST /auth/refresh
```

**请求体**
```json
{
    "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "accessToken": "eyJhbGciOiJSUzI1NiIs...",
        "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
        "expiresIn": 7200
    }
}
```

---

## 3. 技能卡模块 (SkillCards)

### 3.1 获取技能卡列表

```
GET /skillcards
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页数量，默认20，最大50 |
| category | string | 否 | 分类筛选：creative/collection/content/visual/optimize/publish/delivery |
| status | string | 否 | 状态筛选：draft/published |
| keyword | string | 否 | 关键词搜索 |
| owned | boolean | 否 | true=仅我拥有的，false=全部 |

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [
            {
                "id": "skc_abc123",
                "name": "小红书笔记生成器",
                "description": "根据主题自动生成小红书风格的种草笔记",
                "category": "content",
                "categoryName": "内容创作",
                "iconUrl": "https://cdn.example.com/icons/xiaohongshu.png",
                "kernelType": "ai_model",
                "tags": ["小红书", "种草", "文案"],
                "creatorId": "usr_system",
                "creatorName": "官方",
                "isPublic": true,
                "isOwned": true,
                "price": 0,
                "priceType": "free",
                "rating": 4.8,
                "usageCount": 12580,
                "status": "published",
                "createdAt": "2024-09-01T00:00:00Z",
                "updatedAt": "2024-10-01T00:00:00Z"
            }
        ],
        "pagination": {
            "page": 1,
            "pageSize": 20,
            "total": 45,
            "totalPages": 3
        }
    }
}
```

---

### 3.2 获取技能卡详情

```
GET /skillcards/{skillCardId}
```

**路径参数**
| 参数 | 类型 | 说明 |
|------|------|------|
| skillCardId | string | 技能卡ID |

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "skc_abc123",
        "name": "小红书笔记生成器",
        "description": "根据主题自动生成小红书风格的种草笔记，支持自定义风格和关键词",
        "category": "content",
        "categoryName": "内容创作",
        "iconUrl": "https://cdn.example.com/icons/xiaohongshu.png",
        "kernelType": "ai_model",
        "inputSchema": {
            "type": "object",
            "required": ["topic"],
            "properties": {
                "topic": {
                    "type": "string",
                    "title": "主题",
                    "description": "笔记的核心主题",
                    "maxLength": 100
                },
                "style": {
                    "type": "string",
                    "title": "风格",
                    "enum": ["种草", "测评", "教程", "日常"],
                    "default": "种草"
                },
                "keywords": {
                    "type": "array",
                    "title": "关键词",
                    "items": { "type": "string" },
                    "maxItems": 5
                },
                "wordCount": {
                    "type": "integer",
                    "title": "字数",
                    "minimum": 100,
                    "maximum": 1000,
                    "default": 300
                }
            }
        },
        "outputSchema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "title": "标题"
                },
                "content": {
                    "type": "string",
                    "title": "正文内容"
                },
                "tags": {
                    "type": "array",
                    "title": "推荐标签",
                    "items": { "type": "string" }
                },
                "emojis": {
                    "type": "array",
                    "title": "推荐表情",
                    "items": { "type": "string" }
                }
            }
        },
        "kernelConfig": {
            "modelId": "gpt-4o",
            "temperature": 0.8,
            "maxTokens": 2000
            // 注：systemPrompt和userPromptTemplate仅创建者可见
        },
        "tags": ["小红书", "种草", "文案"],
        "creatorId": "usr_system",
        "creatorName": "官方",
        "isPublic": true,
        "isOwned": true,
        "price": 0,
        "priceType": "free",
        "rating": 4.8,
        "ratingCount": 256,
        "usageCount": 12580,
        "status": "published",
        "version": 3,
        "createdAt": "2024-09-01T00:00:00Z",
        "updatedAt": "2024-10-01T00:00:00Z",
        "equippedBy": [
            {
                "employeeId": "emp_001",
                "employeeName": "小明"
            }
        ]
    }
}
```

---

### 3.3 创建技能卡

```
POST /skillcards
```

**请求体**
```json
{
    "name": "自定义文案生成器",
    "description": "根据我的风格生成文案",
    "category": "content",
    "iconUrl": "https://cdn.example.com/icons/custom.png",
    "kernelType": "ai_model",
    "inputSchema": {
        "type": "object",
        "required": ["topic"],
        "properties": {
            "topic": {
                "type": "string",
                "title": "主题"
            }
        }
    },
    "outputSchema": {
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "title": "生成内容"
            }
        }
    },
    "kernelConfig": {
        "modelId": "gpt-4o",
        "systemPrompt": "你是一个专业的文案撰写专家...",
        "userPromptTemplate": "请根据以下主题撰写文案：{{input.topic}}",
        "temperature": 0.7,
        "maxTokens": 1500
    },
    "tags": ["文案", "自定义"]
}
```

**响应 - 成功 (201)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "skc_new123",
        "name": "自定义文案生成器",
        "status": "draft",
        "version": 1,
        "createdAt": "2024-10-15T10:00:00Z"
    }
}
```

---

### 3.4 测试技能卡

```
POST /skillcards/{skillCardId}/test
```

**请求体**
```json
{
    "input": {
        "topic": "秋季护肤",
        "style": "种草",
        "keywords": ["保湿", "敏感肌"],
        "wordCount": 300
    }
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "testId": "test_abc123",
        "status": "completed",
        "input": {
            "topic": "秋季护肤",
            "style": "种草",
            "keywords": ["保湿", "敏感肌"],
            "wordCount": 300
        },
        "output": {
            "title": "🍂秋季护肤｜敏感肌宝宝看过来！",
            "content": "姐妹们！换季敏感肌真的太难了...",
            "tags": ["#秋季护肤", "#敏感肌", "#保湿"],
            "emojis": ["🍂", "💧", "✨"]
        },
        "executionTime": 2340,
        "tokensUsed": 856,
        "executedAt": "2024-10-15T10:05:00Z"
    }
}
```

---

### 3.5 发布技能卡到市场

```
POST /skillcards/{skillCardId}/publish
```

**请求体**
```json
{
    "price": 9.9,
    "priceType": "one_time",       // one_time | subscription
    "licenseType": "standard",      // standard | exclusive
    "description": "市场描述文案...",
    "screenshots": [
        "https://cdn.example.com/screenshots/1.png"
    ]
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "skc_abc123",
        "status": "published",
        "marketStatus": "pending_review",    // pending_review | approved | rejected
        "publishedAt": "2024-10-15T10:10:00Z"
    }
}
```

---

## 4. 员工模块 (Employees)

### 4.1 获取员工列表

```
GET /employees
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态筛选：idle/working |
| hasSkill | boolean | 否 | true=已装备技能，false=未装备 |
| skillCardId | string | 否 | 按装备的技能卡筛选 |

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [
            {
                "id": "emp_001",
                "name": "小明",
                "avatarUrl": "https://cdn.example.com/avatars/emp_001.png",
                "status": "working",
                "statusText": "工作中",
                "positionX": 120,
                "positionY": 80,
                "skillEquip": {
                    "skillCardId": "skc_abc123",
                    "skillCardName": "小红书笔记生成器",
                    "equippedAt": "2024-10-01T00:00:00Z"
                },
                "performance": {
                    "todayTasks": 12,
                    "weekTasks": 68,
                    "successRate": 0.96,
                    "avgExecutionTime": 138
                },
                "currentTask": {
                    "taskId": "tsk_xyz",
                    "taskName": "生成秋季穿搭笔记",
                    "progress": 60
                },
                "createdAt": "2024-09-15T00:00:00Z"
            }
        ],
        "summary": {
            "total": 12,
            "idle": 6,
            "working": 6,
            "equipped": 10,
            "unequipped": 2
        }
    }
}
```

---

### 4.2 招募员工

```
POST /employees
```

**请求体**
```json
{
    "templateId": "tpl_designer_01",
    "name": "小艺"                    // 可选，自定义名字
}
```

**响应 - 成功 (201)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "emp_new001",
        "name": "小艺",
        "avatarUrl": "https://cdn.example.com/avatars/tpl_designer_01.png",
        "status": "idle",
        "personality": {
            "trait": "creative",
            "description": "富有创意，擅长视觉设计"
        },
        "skillEquip": null,
        "createdAt": "2024-10-15T10:00:00Z"
    }
}
```

**响应 - 员工数量达上限 (422)**
```json
{
    "code": 42201,
    "message": "Employee limit reached. Current plan allows 5 employees.",
    "data": {
        "currentCount": 5,
        "maxCount": 5,
        "planType": "free",
        "upgradeTip": "升级到专业版可拥有20名员工"
    }
}
```

---

### 4.3 为员工装备技能卡

```
POST /employees/{employeeId}/equip
```

**请求体**
```json
{
    "skillCardId": "skc_abc123"
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "employeeId": "emp_001",
        "employeeName": "小明",
        "previousSkillCard": null,
        "currentSkillCard": {
            "id": "skc_abc123",
            "name": "小红书笔记生成器"
        },
        "equippedAt": "2024-10-15T10:00:00Z"
    }
}
```

**响应 - 员工正在工作中 (409)**
```json
{
    "code": 40901,
    "message": "Cannot change skill while employee is working",
    "data": {
        "employeeId": "emp_001",
        "status": "working",
        "currentTaskId": "tsk_xyz"
    }
}
```

---

### 4.4 卸载员工技能卡

```
DELETE /employees/{employeeId}/equip
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "employeeId": "emp_001",
        "employeeName": "小明",
        "removedSkillCard": {
            "id": "skc_abc123",
            "name": "小红书笔记生成器"
        },
        "unequippedAt": "2024-10-15T10:00:00Z"
    }
}
```

---

### 4.5 解雇员工

```
DELETE /employees/{employeeId}
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| force | boolean | 否 | 是否强制解雇（即使正在工作） |

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "employeeId": "emp_001",
        "employeeName": "小明",
        "unequippedSkillCard": {
            "id": "skc_abc123",
            "name": "小红书笔记生成器"
        },
        "archivedTasks": 156,
        "deletedAt": "2024-10-15T10:00:00Z"
    }
}
```

---

## 5. 工作流模块 (Workflows)

### 5.1 获取工作流模板列表

```
GET /workflows
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 分类筛选 |
| source | string | 否 | 来源：official/community/mine |

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [
            {
                "id": "wf_tpl_001",
                "name": "小红书内容生产流水线",
                "description": "从热点分析到内容发布的完整流程",
                "category": "content",
                "source": "official",
                "nodeCount": 5,
                "estimatedTime": 300,
                "successRate": 0.94,
                "usageCount": 8520,
                "thumbnail": "https://cdn.example.com/workflows/wf_tpl_001.png",
                "requiredSkillCards": [
                    { "id": "skc_001", "name": "热点分析器" },
                    { "id": "skc_002", "name": "小红书笔记生成器" },
                    { "id": "skc_003", "name": "AI配图生成" }
                ],
                "createdAt": "2024-09-01T00:00:00Z"
            }
        ]
    }
}
```

---

### 5.2 获取工作流详情

```
GET /workflows/{workflowId}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "wf_tpl_001",
        "name": "小红书内容生产流水线",
        "description": "从热点分析到内容发布的完整流程",
        "category": "content",
        "nodes": [
            {
                "id": "node_start",
                "type": "start",
                "name": "开始",
                "position": { "x": 100, "y": 200 }
            },
            {
                "id": "node_1",
                "type": "skill",
                "name": "热点分析",
                "position": { "x": 250, "y": 200 },
                "config": {
                    "skillCardId": "skc_001",
                    "timeout": 60,
                    "retryPolicy": {
                        "maxRetries": 3,
                        "retryDelay": 5000
                    }
                }
            },
            {
                "id": "node_2",
                "type": "skill",
                "name": "文案生成",
                "position": { "x": 400, "y": 200 },
                "config": {
                    "skillCardId": "skc_002",
                    "inputMapping": [
                        {
                            "source": "nodes.node_1.output.topic",
                            "target": "input.topic"
                        },
                        {
                            "source": "nodes.node_1.output.keywords",
                            "target": "input.keywords"
                        }
                    ]
                }
            },
            {
                "id": "node_end",
                "type": "end",
                "name": "结束",
                "position": { "x": 700, "y": 200 }
            }
        ],
        "edges": [
            { "source": "node_start", "target": "node_1" },
            { "source": "node_1", "target": "node_2" },
            { "source": "node_2", "target": "node_end" }
        ],
        "inputSchema": {
            "type": "object",
            "required": ["platform"],
            "properties": {
                "platform": {
                    "type": "string",
                    "title": "目标平台",
                    "enum": ["xiaohongshu", "douyin", "weibo"]
                },
                "count": {
                    "type": "integer",
                    "title": "生成数量",
                    "default": 1,
                    "minimum": 1,
                    "maximum": 10
                }
            }
        },
        "version": 3,
        "createdAt": "2024-09-01T00:00:00Z",
        "updatedAt": "2024-10-01T00:00:00Z"
    }
}
```

---

### 5.3 创建自定义工作流

```
POST /workflows
```

**请求体**
```json
{
    "name": "我的文案流水线",
    "description": "自定义的内容生产流程",
    "category": "content",
    "nodes": [
        {
            "id": "node_start",
            "type": "start",
            "name": "开始",
            "position": { "x": 100, "y": 200 }
        },
        {
            "id": "node_1",
            "type": "skill",
            "name": "文案生成",
            "position": { "x": 250, "y": 200 },
            "config": {
                "skillCardId": "skc_002"
            }
        },
        {
            "id": "node_end",
            "type": "end",
            "name": "结束",
            "position": { "x": 400, "y": 200 }
        }
    ],
    "edges": [
        { "source": "node_start", "target": "node_1" },
        { "source": "node_1", "target": "node_end" }
    ]
}
```

**响应 - 成功 (201)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "wf_custom_001",
        "name": "我的文案流水线",
        "status": "draft",
        "version": 1,
        "createdAt": "2024-10-15T10:00:00Z"
    }
}
```

---

## 6. 任务模块 (Tasks)

### 6.1 创建并发布任务

```
POST /tasks
```

**请求体**
```json
{
    "workflowId": "wf_tpl_001",
    "name": "生成秋季穿搭笔记",
    "priority": 5,
    "inputParams": {
        "platform": "xiaohongshu",
        "count": 5
    },
    "scheduledAt": null              // null=立即执行，或指定时间
}
```

**响应 - 成功 (201)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "tsk_abc123",
        "name": "生成秋季穿搭笔记",
        "workflowId": "wf_tpl_001",
        "workflowName": "小红书内容生产流水线",
        "status": "running",
        "priority": 5,
        "progress": 0,
        "stepsTotal": 5,
        "stepsCompleted": 0,
        "estimatedTime": 300,
        "createdAt": "2024-10-15T10:00:00Z",
        "startedAt": "2024-10-15T10:00:01Z"
    }
}
```

---

### 6.2 获取任务列表

```
GET /tasks
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态：pending/running/paused/completed/failed/cancelled |
| priority | int | 否 | 优先级筛选 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [
            {
                "id": "tsk_abc123",
                "name": "生成秋季穿搭笔记",
                "workflowId": "wf_tpl_001",
                "workflowName": "小红书内容生产流水线",
                "status": "running",
                "statusText": "执行中",
                "priority": 5,
                "progress": 60,
                "stepsTotal": 5,
                "stepsCompleted": 3,
                "currentStep": {
                    "id": "step_004",
                    "name": "配图生成",
                    "employeeId": "emp_003",
                    "employeeName": "小华"
                },
                "createdAt": "2024-10-15T10:00:00Z",
                "startedAt": "2024-10-15T10:00:01Z",
                "estimatedCompletionAt": "2024-10-15T10:05:00Z"
            }
        ],
        "summary": {
            "total": 28,
            "pending": 2,
            "running": 3,
            "paused": 0,
            "completed": 20,
            "failed": 2,
            "cancelled": 1
        }
    }
}
```

---

### 6.3 获取任务详情

```
GET /tasks/{taskId}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "tsk_abc123",
        "name": "生成秋季穿搭笔记",
        "workflowId": "wf_tpl_001",
        "workflowName": "小红书内容生产流水线",
        "status": "completed",
        "priority": 5,
        "progress": 100,
        "inputParams": {
            "platform": "xiaohongshu",
            "count": 5
        },
        "outputResult": {
            "articles": [
                {
                    "title": "🍂秋季穿搭｜这几套太好看了！",
                    "content": "姐妹们...",
                    "imageUrl": "https://cdn.example.com/generated/img_001.png"
                }
            ]
        },
        "steps": [
            {
                "id": "step_001",
                "nodeId": "node_1",
                "name": "热点分析",
                "skillCardId": "skc_001",
                "skillCardName": "热点分析器",
                "status": "completed",
                "employeeId": "emp_001",
                "employeeName": "小明",
                "inputData": { "platform": "xiaohongshu" },
                "outputData": { "topic": "秋季穿搭", "keywords": ["毛衣", "外套"] },
                "startedAt": "2024-10-15T10:00:01Z",
                "completedAt": "2024-10-15T10:00:45Z",
                "duration": 44000
            }
        ],
        "timeline": [
            {
                "event": "task_created",
                "message": "任务已创建",
                "timestamp": "2024-10-15T10:00:00Z"
            },
            {
                "event": "task_started",
                "message": "任务开始执行",
                "timestamp": "2024-10-15T10:00:01Z"
            },
            {
                "event": "step_completed",
                "message": "步骤「热点分析」已完成",
                "data": { "stepId": "step_001", "employeeName": "小明" },
                "timestamp": "2024-10-15T10:00:45Z"
            }
        ],
        "createdAt": "2024-10-15T10:00:00Z",
        "startedAt": "2024-10-15T10:00:01Z",
        "completedAt": "2024-10-15T10:04:30Z",
        "totalDuration": 269000
    }
}
```

---

### 6.4 暂停任务

```
POST /tasks/{taskId}/pause
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": "tsk_abc123",
        "status": "paused",
        "pausedAt": "2024-10-15T10:02:00Z",
        "pausedAtStep": {
            "stepId": "step_003",
            "stepName": "文案生成"
        }
    }
}
```

---

### 6.5 恢复任务

```
POST /tasks/{taskId}/resume
```

---

### 6.6 取消任务

```
POST /tasks/{taskId}/cancel
```

**请求体**
```json
{
    "reason": "不需要了"              // 可选
}
```

---

### 6.7 重试失败任务

```
POST /tasks/{taskId}/retry
```

**请求体**
```json
{
    "fromStep": "step_003"           // 可选，从指定步骤重试
}
```

---

## 7. 驾驶舱模块 (Dashboard)

### 7.1 获取仪表盘概览

```
GET /dashboard/overview
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "kpis": {
            "todayTasks": {
                "value": 28,
                "change": 0.12,
                "changeType": "increase"
            },
            "successRate": {
                "value": 0.963,
                "change": 0.021,
                "changeType": "increase"
            },
            "teamEfficiency": {
                "value": 0.875,
                "change": -0.012,
                "changeType": "decrease"
            },
            "weeklyRevenue": {
                "value": 2340,
                "change": 0.18,
                "changeType": "increase"
            },
            "activeEmployees": {
                "value": 12,
                "total": 15
            }
        },
        "alerts": [
            {
                "id": "alert_001",
                "level": "warning",
                "title": "任务执行超时",
                "message": "任务#28「生成产品文案」执行时间超过预期200%",
                "taskId": "tsk_028",
                "createdAt": "2024-10-15T09:45:00Z",
                "actions": ["retry", "skip", "cancel"]
            }
        ],
        "runningTasks": [
            {
                "id": "tsk_abc123",
                "name": "生成秋季穿搭笔记",
                "progress": 60,
                "currentStep": "配图生成"
            }
        ],
        "employeeStatus": {
            "idle": 6,
            "working": 9
        }
    }
}
```

---

### 7.2 获取活动流

```
GET /dashboard/activities
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | int | 否 | 数量限制，默认20 |
| before | string | 否 | 分页游标 |

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [
            {
                "id": "act_001",
                "type": "task_completed",
                "icon": "✓",
                "message": "任务#27 已完成",
                "detail": "小红书笔记生成任务已成功完成",
                "relatedId": "tsk_027",
                "relatedType": "task",
                "timestamp": "2024-10-15T10:32:00Z"
            },
            {
                "id": "act_002",
                "type": "employee_started",
                "icon": "▶",
                "message": "员工小明开始执行文案生成",
                "relatedId": "emp_001",
                "relatedType": "employee",
                "timestamp": "2024-10-15T10:28:00Z"
            }
        ],
        "nextCursor": "act_020"
    }
}
```

---

## 8. 秘书模块 (Secretary)

### 8.1 发送指令给私人秘书

```
POST /secretary/command
```

**请求体**
```json
{
    "message": "帮我写5篇小红书笔记，主题是秋季穿搭",
    "context": {
        "conversationId": "conv_123",    // 可选，多轮对话ID
        "replyTo": "msg_456"              // 可选，回复某条消息
    }
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "messageId": "msg_789",
        "conversationId": "conv_123",
        "intent": {
            "type": "create_task",
            "confidence": 0.95
        },
        "response": {
            "text": "好的老板！我来帮您安排。将使用「小红书内容生产流水线」生成5篇秋季穿搭主题的笔记。预计需要5分钟左右，现在开始吗？",
            "actions": [
                {
                    "type": "confirm",
                    "label": "立即开始",
                    "payload": {
                        "action": "create_task",
                        "workflowId": "wf_tpl_001",
                        "params": { "topic": "秋季穿搭", "count": 5 }
                    }
                },
                {
                    "type": "modify",
                    "label": "修改参数"
                },
                {
                    "type": "cancel",
                    "label": "取消"
                }
            ]
        },
        "timestamp": "2024-10-15T10:00:00Z"
    }
}
```

---

### 8.2 执行秘书建议的操作

```
POST /secretary/command/execute
```

**请求体**
```json
{
    "conversationId": "conv_123",
    "messageId": "msg_789",
    "actionType": "confirm",
    "payload": {
        "action": "create_task",
        "workflowId": "wf_tpl_001",
        "params": { "topic": "秋季穿搭", "count": 5 }
    }
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "messageId": "msg_790",
        "response": {
            "text": "任务已创建并开始执行！任务编号#29，您可以在任务中心查看进度。有什么其他需要帮忙的吗？",
            "relatedTask": {
                "id": "tsk_029",
                "name": "生成秋季穿搭笔记"
            }
        },
        "timestamp": "2024-10-15T10:00:05Z"
    }
}
```

---

### 8.3 获取业务简报

```
GET /secretary/reports/daily
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 否 | 日期，默认昨天，格式YYYY-MM-DD |

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "reportId": "rpt_daily_20241014",
        "reportDate": "2024-10-14",
        "greeting": "早上好，老板！昨天公司运转得不错呢~",
        "summary": {
            "tasksCompleted": 23,
            "tasksCreated": 25,
            "successRate": 0.92,
            "avgCompletionTime": 245,
            "employeeUtilization": 0.78,
            "comparedToYesterday": {
                "tasksChange": 0.15,
                "successRateChange": 0.02
            }
        },
        "highlights": [
            {
                "type": "achievement",
                "icon": "🎉",
                "content": "员工小明连续3天保持100%任务成功率，表现优秀！"
            },
            {
                "type": "efficiency",
                "icon": "⚡",
                "content": "「小红书内容流水线」平均执行时间缩短了15%"
            }
        ],
        "concerns": [
            {
                "type": "warning",
                "icon": "⚠️",
                "content": "员工小华疲劳值较高，建议安排休息",
                "actionSuggestion": "让小华休息30分钟",
                "action": {
                    "type": "rest_employee",
                    "employeeId": "emp_003"
                }
            }
        ],
        "recommendations": [
            {
                "content": "本周热点话题「秋季护肤」热度上升，建议增加相关内容产出",
                "action": {
                    "type": "create_task",
                    "suggestedWorkflow": "wf_tpl_001",
                    "suggestedParams": { "topic": "秋季护肤" }
                }
            }
        ],
        "closing": "今天也要加油哦！有什么需要随时叫我~",
        "generatedAt": "2024-10-15T08:00:00Z"
    }
}
```

---

### 8.4 更新用户状态

```
PUT /secretary/user-state
```

**请求体**
```json
{
    "status": "traveling",
    "duration": 72,                  // 持续时间（小时），可选
    "preferences": {
        "notificationLevel": "critical"
    }
}
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "status": "traveling",
        "statusText": "旅行中",
        "setAt": "2024-10-15T10:00:00Z",
        "expiresAt": "2024-10-18T10:00:00Z",
        "appliedSettings": {
            "notificationLevel": "critical",
            "workMode": "light"
        },
        "secretaryMessage": "旅途愉快，老板！我会帮您盯着公司，只有重要事项才会打扰您~"
    }
}
```

---

## 9. WebSocket 实时通信

### 9.1 连接地址

```
wss://api.unlimited-corp.com/ws?token={accessToken}
```

### 9.2 消息格式

#### 客户端发送 - 订阅频道
```json
{
    "action": "subscribe",
    "channels": ["dashboard", "task.tsk_abc123", "employee.status"]
}
```

#### 客户端发送 - 取消订阅
```json
{
    "action": "unsubscribe",
    "channels": ["task.tsk_abc123"]
}
```

#### 服务端推送 - 事件消息
```json
{
    "channel": "task.tsk_abc123",
    "event": "step_completed",
    "data": {
        "taskId": "tsk_abc123",
        "stepId": "step_003",
        "stepName": "文案生成",
        "employeeName": "小明",
        "progress": 60
    },
    "timestamp": 1697360400000
}
```

### 9.3 事件类型清单

| 频道 | 事件 | 说明 |
|------|------|------|
| dashboard | kpi_updated | KPI数据更新 |
| dashboard | alert_created | 新预警产生 |
| dashboard | activity_created | 新活动动态 |
| task.{taskId} | status_changed | 任务状态变更 |
| task.{taskId} | progress_updated | 进度更新 |
| task.{taskId} | step_started | 步骤开始 |
| task.{taskId} | step_completed | 步骤完成 |
| task.{taskId} | step_failed | 步骤失败 |
| employee.status | status_changed | 员工状态变更 |
| secretary | message | 秘书主动消息 |

---

## 10. 人才市场模块 (TalentMarket)

### 10.1 获取可招募员工模板

```
GET /talent-market
```

**响应 - 成功 (200)**
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [
            {
                "id": "tpl_writer_01",
                "name": "文案小能手",
                "avatarUrl": "https://cdn.example.com/templates/writer.png",
                "rarity": "common",
                "personality": {
                    "trait": "diligent",
                    "description": "勤奋踏实，执行力强"
                },
                "recommendedSkills": ["content", "optimize"],
                "introduction": "擅长文字工作，是内容创作的好帮手",
                "available": true
            },
            {
                "id": "tpl_designer_01",
                "name": "创意设计师",
                "avatarUrl": "https://cdn.example.com/templates/designer.png",
                "rarity": "rare",
                "personality": {
                    "trait": "creative",
                    "description": "富有创意，审美独特"
                },
                "recommendedSkills": ["visual"],
                "introduction": "视觉设计领域的专家，让作品更有美感",
                "available": true,
                "requiresPlan": "professional"
            }
        ]
    }
}
```

---

*文档结束，更多API将在后续版本中补充*
