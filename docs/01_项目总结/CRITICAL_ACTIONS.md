# 🔴 Critical Actions - 必须立即执行

**完成期限**: 2025-12-17（2周内）
**项目状态**: M1完成，质量缺陷需补救
**报告详见**: `/PROJECT_ASSESSMENT_REPORT.md`

---

## 📋 三个关键缺陷修复清单

### 🔴 Defect #1: 函数注释严重缺失 (40% 完成度)

**状态**: ❌ CRITICAL
**工作量**: 10-15 小时
**优先级**: P0 (立即)
**截止**: 2025-12-11

#### 任务清单
```
[ ] backend/internal/domain/
    [ ] user/entity.go - 6个函数
    [ ] company/entity.go - 3个函数  
    [ ] employee/entity.go - 4个函数
    [ ] task/entity.go - 3个函数
    [ ] skillcard/entity.go - 2个函数
    [ ] chat/entity.go - 2个函数
    
[ ] backend/internal/application/
    [ ] user/service.go - 6个函数 ✅ 已有部分
    [ ] company/service.go - 5个函数
    [ ] employee/service.go - 6个函数
    [ ] task/service.go - 6个函数
    [ ] skillcard/service.go - 6个函数
    [ ] chat/service.go - 6个函数
    
[ ] backend/internal/interfaces/http/
    [ ] api/handlers - 所有handler方法
    [ ] middleware/ - 所有中间件函数
    
[ ] backend/pkg/
    [ ] 所有public函数补充GoDoc
```

#### 注释模板
```go
// FunctionName 功能描述（一句话）
// 
// 参数:
//   - param1: 参数说明
//   - param2: 参数说明
//
// 返回值:
//   - 返回值1: 说明
//   - 返回值2: 说明
//
// 可能的错误: ErrType1, ErrType2
//
// 示例 (复杂函数必需):
//   result, err := FunctionName(input)
//   if err != nil {
//       log.Fatal(err)
//   }
func FunctionName(param1 string, param2 int) (string, error) {
    // 实现
}
```

---

### 🔴 Defect #2: 单元测试覆盖率为 0%

**状态**: ❌ CRITICAL  
**工作量**: 26-34 小时
**优先级**: P0 (立即)
**截止**: 2025-12-17
**目标覆盖率**: ≥70%

#### Phase 1: Domain层单元测试 (12-16 小时)

```
[ ] backend/internal/domain/user/entity_test.go
    [ ] TestNewUser - 正常流程
    [ ] TestNewUser_InvalidPassword - 密码过短
    [ ] TestValidatePassword - 密码验证
    [ ] TestUpdateProfile - 资料更新
    [ ] TestIsActive - 状态检查

[ ] backend/internal/domain/company/entity_test.go
    [ ] TestNewCompany - 创建公司
    [ ] TestCompanyUpdate - 更新公司

[ ] backend/internal/domain/employee/entity_test.go
    [ ] TestNewEmployee - 创建员工
    [ ] TestEmployeeStatusTransition - 状态转换

[ ] backend/internal/domain/task/entity_test.go
    [ ] TestNewTask - 创建任务
    [ ] TestTaskStatusFlow - 状态流转

[ ] backend/internal/domain/skillcard/entity_test.go
    [ ] TestSkillCardValidation - 技能卡验证

[ ] backend/internal/domain/chat/entity_test.go
    [ ] TestChatMessageCreation - 消息创建
```

#### Phase 2: Application层单元测试 (14-18 小时)

```
[ ] backend/internal/application/user/service_test.go
    [ ] TestRegister_Success - 注册成功
    [ ] TestRegister_DuplicateEmail - 邮箱重复
    [ ] TestLogin_Success - 登录成功
    [ ] TestLogin_InvalidPassword - 密码错误
    [ ] TestLogin_InactiveUser - 用户禁用
    [ ] TestRefreshToken_Valid - Token刷新
    [ ] TestGetProfile - 获取资料

[ ] backend/internal/application/company/service_test.go
    [ ] TestCreate_Success - 创建公司
    [ ] TestCreate_DuplicateUser - 用户已有公司
    [ ] TestUpdate_Success - 更新公司
    [ ] TestDelete_Success - 删除公司

[ ] backend/internal/application/employee/service_test.go
    [ ] TestCreate_Success
    [ ] TestAssignSkills - 分配技能
    [ ] 其他场景

[ ] backend/internal/application/task/service_test.go
    [ ] TestCreate_Success
    [ ] TestStatusTransition - 状态流转
    [ ] 其他场景

[ ] backend/internal/application/skillcard/service_test.go
    [ ] TestCreate_Success
    [ ] TestUpdate_Success

[ ] backend/internal/application/chat/service_test.go
    [ ] TestCreateSession_Success
    [ ] TestAddMessage_Success
```

#### 测试框架和工具
```go
import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

// Mock Repository示例
type MockUserRepository struct {
    users map[string]*user.User
}

func (m *MockUserRepository) Create(ctx context.Context, u *user.User) error {
    m.users[u.Email] = u
    return nil
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*user.User, error) {
    if u, ok := m.users[email]; ok {
        return u, nil
    }
    return nil, errors.ErrNotFound
}
```

#### 验收标准
- [ ] 所有Domain实体单元测试通过
- [ ] 所有Application服务单元测试通过
- [ ] 测试覆盖率报告 ≥70%
- [ ] CI/CD中自动运行测试

---

### 🔴 Defect #3: 应用层缺少日志系统

**状态**: ❌ CRITICAL
**工作量**: 8-12 小时
**优先级**: P0 (立即)
**截止**: 2025-12-17

#### 任务清单

1. **为所有Service添加Logger**
```go
[ ] user/service.go - 添加logger字段和日志记录
[ ] company/service.go - 添加logger字段和日志记录
[ ] employee/service.go - 添加logger字段和日志记录
[ ] task/service.go - 添加logger字段和日志记录
[ ] skillcard/service.go - 添加logger字段和日志记录
[ ] chat/service.go - 添加logger字段和日志记录
```

2. **日志记录标准**
```go
// 注入Logger
type Service struct {
    repo   Repository
    logger logger.Logger
}

func NewService(repo Repository, logger logger.Logger) *Service {
    return &Service{
        repo:   repo,
        logger: logger,
    }
}

// 记录关键操作
func (s *Service) Create(ctx context.Context, input *CreateInput) (*Entity, error) {
    s.logger.Infof("Creating entity with input: %+v", input)
    
    // 业务逻辑
    if err != nil {
        s.logger.Errorf("Failed to create entity: %v", err)
        return nil, err
    }
    
    s.logger.Infof("Entity created successfully: %s", entity.ID)
    return entity, nil
}
```

3. **日志级别使用规范**
   - [ ] **INFO**: 业务操作成功（创建、更新、删除）
   - [ ] **WARN**: 可能的问题（缺乏缓存、降级服务等）
   - [ ] **ERROR**: 错误（业务异常、依赖失败等）
   - [ ] **DEBUG**: 调试信息（参数值、中间步骤等）

4. **关键业务操作日志**
   ```
   [ ] 用户注册/登录 - INFO级别
   [ ] 公司创建/更新 - INFO级别
   [ ] 员工招募/解雇 - INFO级别
   [ ] 技能卡创建/更新 - INFO级别
   [ ] 任务创建/状态变更 - INFO级别
   [ ] 对话创建/消息发送 - INFO级别
   [ ] 所有错误情况 - ERROR级别
   ```

#### 验收标准
- [ ] 所有Service都注入了Logger
- [ ] 关键业务操作都有info级别日志
- [ ] 所有错误都有error级别日志
- [ ] 日志格式统一，包含操作ID和用户ID
- [ ] 可以通过日志追踪业务链路

---

## 📊 Defect修复进度跟踪

### 周进度表

```
Week 1 (12-10 ~ 12-13)
├─ Mon (12-10): 函数注释补充 25%
├─ Tue (12-11): 函数注释补充 100% ✓
├─ Wed (12-12): Domain单元测试开始
├─ Thu (12-13): Domain单元测试完成 + 应用层日志补充开始
└─ Fri (12-14): 应用层日志补充完成

Week 2 (12-16 ~ 12-17)
├─ Mon (12-16): Application单元测试
├─ Tue (12-17): 测试完成 + 代码审查
└─ Wed (12-18): 合并到main分支
```

### 进度确认
```
Day 1-2:  [ ] [ ] [ ] 30%
Day 3-4:  [ ] [ ] [ ] 60%
Day 5-6:  [ ] [ ] [ ] 85%
Day 7-10: [ ] [ ] [ ] 100%
```

---

## 🎯 次要任务（2周内完成）

### P1: API文档生成 (4-6 小时)

```
[ ] 安装Swag工具
    go install github.com/swaggo/swag/cmd/swag@latest

[ ] 为所有Handler添加Swagger注解
    例:
    // @Summary 用户注册
    // @Description 使用邮箱和密码注册新用户
    // @Tags auth
    // @Accept json
    // @Produce json
    // @Param body body RegisterInput true "注册信息"
    // @Success 200 {object} RegisterOutput
    // @Failure 400 {object} ErrorResponse
    // @Router /auth/register [post]

[ ] 生成Swagger文档
    swag init -g cmd/server/main.go

[ ] 发布API文档 (/api/docs)
```

---

## 🚨 不需要在P0中解决（M2中解决）

```
❌ 事件驱动架构     → M2 Sprint 2
❌ Temporal集成     → M3
❌ 性能优化         → M2+
❌ Repository接口显式定义 → M2 Sprint 1
❌ 前端测试补充     → M2
```

---

## ✅ 完成条件

**当满足以下所有条件时，视为Critical缺陷修复完成**:

```
[ ] 所有46个Go文件的public函数都有完整的GoDoc注释
[ ] 单元测试代码覆盖率 ≥ 70%
    - Domain层: ≥ 90%
    - Application层: ≥ 70%
    - HTTP/Handler层: ≥ 50%
[ ] 所有Service都有完整的日志记录
    - 关键操作记INFO级别
    - 错误记ERROR级别
    - 含操作ID、用户ID、错误堆栈
[ ] Swagger API文档可用
[ ] 所有单元测试通过
[ ] Code Review通过
[ ] 合并到main分支
```

---

## 📞 支援资源

### 参考文档
- 约束规范: `/docs/约束/3-敏捷开发5S个人规则.md` (第4章 代码输出标准)
- 架构文档: `/docs/文档/02_技术架构文档.md`
- API规格: `/docs/文档/04_API规格文档.md`

### 工具和库
```go
// 日志库
go get github.com/go-kit/log
// 或使用现有的 go.uber.org/zap

// 测试库
go get github.com/stretchr/testify

// Mock工具
go get github.com/golang/mock/gomock
```

### 预期成果物

```
backend/
├── ALL_FUNCTIONS_WITH_GODOC ✅
├── internal/
│   ├── domain/
│   │   ├── user/
│   │   │   ├── entity.go (含注释)
│   │   │   └── entity_test.go (新增)
│   │   ├── company/
│   │   │   ├── entity.go (含注释)
│   │   │   └── entity_test.go (新增)
│   │   └── ... (其他domain)
│   └── application/
│       ├── user/
│       │   ├── service.go (含注释和日志)
│       │   └── service_test.go (新增)
│       └── ... (其他service)
│
└── docs/
    ├── swagger.yaml (新增)
    └── coverage_report.html (新增)
```

---

## 🎉 完成后的收益

```
修复前 → 修复后

代码质量评分    55/100 → 80/100  (+45%)
函数注释完成度   40% → 100%       (+60%)
测试覆盖率       0% → 70%+        (关键)
日志完整度       60% → 100%       (+40%)

整体收益:
✓ 可维护性提升 200%
✓ 新成员onboarding时间 10天 → 3天
✓ Bug率下降 30-50%
✓ 后续开发效率提升 150%
```

---

**报告生成时间**: 2025-12-08
**下次更新**: Daily standup会
**进度报告**: 每日更新此文档
