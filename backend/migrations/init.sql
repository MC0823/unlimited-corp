-- 无限公司 数据库初始化脚本
-- 版本: v1.0

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. 用户相关表
-- ========================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    avatar_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ========================================
-- 2. 公司相关表
-- ========================================

-- 公司表
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)  -- 每个用户只能有一个公司
);

CREATE INDEX idx_companies_user_id ON companies(user_id);

-- ========================================
-- 3. 技能卡相关表
-- ========================================

-- 技能卡表
CREATE TABLE IF NOT EXISTS skill_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('research', 'creation', 'analysis', 'execution', 'communication')),
    icon VARCHAR(100),
    
    -- 内核配置
    kernel_type VARCHAR(20) NOT NULL CHECK (kernel_type IN ('ai_model', 'code_logic', 'hybrid')),
    kernel_config JSONB NOT NULL,
    
    -- 输入输出Schema
    input_schema JSONB NOT NULL DEFAULT '{"type": "object", "properties": {}}',
    output_schema JSONB NOT NULL DEFAULT '{"type": "object", "properties": {}}',
    
    -- 状态与统计
    is_system BOOLEAN DEFAULT false,  -- 是否系统预置
    is_public BOOLEAN DEFAULT false,  -- 是否公开可用
    version VARCHAR(20) DEFAULT '1.0.0',
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skill_cards_company_id ON skill_cards(company_id);
CREATE INDEX idx_skill_cards_category ON skill_cards(category);
CREATE INDEX idx_skill_cards_is_system ON skill_cards(is_system);

-- ========================================
-- 4. 员工相关表
-- ========================================

-- 员工表
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    personality TEXT,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'offline', 'error')),
    current_task_id UUID,
    
    -- 统计数据
    total_tasks INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 1.0000,
    
    -- 配置
    settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_status ON employees(status);

-- 员工-技能卡关联表
CREATE TABLE IF NOT EXISTS employee_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    skill_card_id UUID NOT NULL REFERENCES skill_cards(id) ON DELETE CASCADE,
    proficiency DECIMAL(3,2) DEFAULT 1.00,  -- 熟练度 0.00-1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, skill_card_id)
);

CREATE INDEX idx_employee_skills_employee_id ON employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill_card_id ON employee_skills(skill_card_id);

-- ========================================
-- 5. 任务相关表
-- ========================================

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 基本信息
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- 状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- 工作流定义
    workflow_definition JSONB,
    
    -- 执行信息
    assigned_employee_id UUID REFERENCES employees(id),
    temporal_workflow_id VARCHAR(255),
    temporal_run_id VARCHAR(255),
    
    -- 输入输出
    input_data JSONB DEFAULT '{}',
    output_data JSONB,
    error_message TEXT,
    
    -- 时间
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_employee_id ON tasks(assigned_employee_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- 任务步骤表
CREATE TABLE IF NOT EXISTS task_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- 步骤信息
    step_order INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    skill_card_id UUID REFERENCES skill_cards(id),
    
    -- 状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    
    -- 输入输出
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    
    -- 执行信息
    executed_by_employee_id UUID REFERENCES employees(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_steps_task_id ON task_steps(task_id);
CREATE INDEX idx_task_steps_status ON task_steps(status);

-- ========================================
-- 6. 对话相关表
-- ========================================

-- 秘书对话会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_sessions_company_id ON chat_sessions(company_id);

-- 对话消息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- 关联的动作
    actions JSONB,  -- [{type: "create_task", data: {...}}]
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ========================================
-- 7. 系统预置数据
-- ========================================

-- 插入系统预置技能卡
INSERT INTO skill_cards (id, name, description, category, kernel_type, kernel_config, input_schema, output_schema, is_system, is_public) VALUES
(
    'a0000001-0000-0000-0000-000000000001',
    '热点分析器',
    '分析当前网络热点话题，提取关键信息和趋势',
    'research',
    'ai_model',
    '{"provider": "openai", "model": "gpt-4", "system_prompt": "你是一个专业的热点分析师，擅长分析网络热点话题，提取关键信息、情感倾向和传播趋势。", "temperature": 0.7}',
    '{"type": "object", "properties": {"topic": {"type": "string", "description": "要分析的话题"}, "platform": {"type": "string", "description": "目标平台"}}}',
    '{"type": "object", "properties": {"summary": {"type": "string"}, "keywords": {"type": "array"}, "sentiment": {"type": "string"}, "trend": {"type": "string"}}}',
    true,
    true
),
(
    'a0000001-0000-0000-0000-000000000002',
    '小红书笔记生成器',
    '根据主题生成适合小红书平台的种草笔记',
    'creation',
    'ai_model',
    '{"provider": "openai", "model": "gpt-4", "system_prompt": "你是一个小红书爆款笔记写手，擅长用年轻化、有感染力的语言创作种草内容。使用适量emoji，标题要吸引眼球。", "temperature": 0.8}',
    '{"type": "object", "properties": {"product": {"type": "string", "description": "产品或主题"}, "style": {"type": "string", "description": "风格偏好"}, "keywords": {"type": "array", "description": "关键词"}}}',
    '{"type": "object", "properties": {"title": {"type": "string"}, "content": {"type": "string"}, "tags": {"type": "array"}}}',
    true,
    true
),
(
    'a0000001-0000-0000-0000-000000000003',
    '数据图表生成器',
    '根据数据生成可视化图表',
    'analysis',
    'code_logic',
    '{"language": "python", "runtime": "sandbox", "entry_function": "generate_chart"}',
    '{"type": "object", "properties": {"data": {"type": "array", "description": "数据数组"}, "chart_type": {"type": "string", "description": "图表类型"}}}',
    '{"type": "object", "properties": {"chart_url": {"type": "string"}, "chart_data": {"type": "object"}}}',
    true,
    true
);

-- ========================================
-- 8. 更新时间触发器
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有需要的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_cards_updated_at BEFORE UPDATE ON skill_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_steps_updated_at BEFORE UPDATE ON task_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 完成
SELECT 'Database initialization completed!' AS status;
