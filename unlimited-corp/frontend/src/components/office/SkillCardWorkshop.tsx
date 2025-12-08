import { useState } from 'react'
import {
  Form,
  Input,
  Select,
  Tabs,
  Button,
  Space,
  message,
  Spin,
  InputNumber,
  Modal,
} from 'antd'
import {
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import type {
  SkillCardFormData,
  SkillCategory,
  AIModel,
  CodeRuntime,
  JSONSchema,
  JSONSchemaProperty,
} from '@/types/skillcard'
import * as skillCardApi from '@/api/skillcard'

interface SkillCardWorkshopProps {
  onClose: () => void
  onSuccess?: () => void
}

const SKILL_CATEGORIES: { label: string; value: SkillCategory }[] = [
  { label: '创意策略', value: 'creative' },
  { label: '素材获取', value: 'collection' },
  { label: '内容创作', value: 'content' },
  { label: '视觉设计', value: 'visual' },
  { label: '优化质检', value: 'optimize' },
  { label: '发布运营', value: 'publish' },
  { label: '合成交付', value: 'delivery' },
]

const AI_MODELS: { label: string; value: AIModel }[] = [
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-3.5', value: 'gpt-3.5' },
  { label: 'Claude 3', value: 'claude-3' },
  { label: 'Claude 2', value: 'claude-2' },
  { label: 'DALL-E 3', value: 'dall-e-3' },
  { label: 'DALL-E 2', value: 'dall-e-2' },
]

const CODE_RUNTIMES: { label: string; value: CodeRuntime }[] = [
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
]

// 提示词示例
const PROMPT_EXAMPLES = {
  system: `你是一个专业的{{role}}，擅长{{expertise}}。
你的任务是帮助用户{{task_description}}。`,
  user: `请根据以下要求完成任务：

标题：{{input.title}}
内容：{{input.content}}
风格要求：{{input.style | default:"正式"}}

{{#if input.keywords}}关键词：{{input.keywords | join:", "}}{{/if}}`,
}

// Schema 编辑器行项
interface SchemaField {
  key: string
  type: string
  title: string
  required: boolean
}

export function SkillCardWorkshop({ onClose, onSuccess }: SkillCardWorkshopProps) {
  const [form] = Form.useForm<SkillCardFormData>()
  const [loading, setLoading] = useState(false)
  const [kernelType, setKernelType] = useState<'ai_model' | 'code_logic'>('ai_model')
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  // Schema 编辑器状态
  const [inputFields, setInputFields] = useState<SchemaField[]>([
    { key: 'input_1', type: 'string', title: '输入字段', required: false },
  ])
  const [outputFields, setOutputFields] = useState<SchemaField[]>([
    { key: 'output_1', type: 'string', title: '输出字段', required: false },
  ])

  // 生成 JSON Schema
  const generateSchema = (fields: SchemaField[]): JSONSchema => {
    const properties: Record<string, JSONSchemaProperty> = {}
    const required: string[] = []

    fields.forEach((field) => {
      if (field.title) {
        properties[field.title] = {
          type: field.type as any,
          title: field.title,
        }
        if (field.required) {
          required.push(field.title)
        }
      }
    })

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    }
  }

  // 保存草稿
  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      const inputSchema = generateSchema(inputFields)
      const outputSchema = generateSchema(outputFields)

      const kernelConfig = {
        ...(kernelType === 'ai_model'
          ? {
              modelId: values.ai_model,
              systemPrompt: values.system_prompt,
              userPromptTemplate: values.user_prompt_template,
              temperature: values.temperature || 1.0,
              maxTokens: values.max_tokens,
            }
          : {
              runtime: values.code_runtime,
              code: values.code,
              dependencies: values.dependencies || [],
            }),
      }

      const payload: any = {
        name: values.name,
        description: values.description,
        category: values.category,
        kernel_type: values.kernel_type,
        kernel_config: kernelConfig,
        input_schema: inputSchema,
        output_schema: outputSchema,
      }

      await skillCardApi.createSkillCard(payload)
      message.success('技能卡已保存为草稿')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      message.error(error.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  // 发布技能卡
  const handlePublish = async () => {
    Modal.confirm({
      title: '发布技能卡',
      content: '发布后将无法编辑，确定要发布吗？',
      okText: '发布',
      cancelText: '取消',
      onOk: async () => {
        await handleSaveDraft()
      },
    })
  }

  // 运行测试
  const handleTest = async () => {
    try {
      const values = await form.validateFields()
      setTestLoading(true)

      const testData = values.test_input || {}

      // 模拟测试结果
      const result = {
        status: 'success',
        executionTime: Math.random() * 5000,
        input: testData,
        output: {
          result: '这是测试输出示例',
          timestamp: new Date().toISOString(),
        },
      }

      setTestResult(result)
      message.success('测试执行成功')
    } catch (error: any) {
      message.error('测试失败：' + (error.message || ''))
    } finally {
      setTestLoading(false)
    }
  }

  // 添加输入字段
  const addInputField = () => {
    setInputFields([
      ...inputFields,
      {
        key: `input_${Date.now()}`,
        type: 'string',
        title: '',
        required: false,
      },
    ])
  }

  // 删除输入字段
  const removeInputField = (key: string) => {
    setInputFields(inputFields.filter((f) => f.key !== key))
  }

  // 添加输出字段
  const addOutputField = () => {
    setOutputFields([
      ...outputFields,
      {
        key: `output_${Date.now()}`,
        type: 'string',
        title: '',
        required: false,
      },
    ])
  }

  // 删除输出字段
  const removeOutputField = (key: string) => {
    setOutputFields(outputFields.filter((f) => f.key !== key))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-auto"
    >
      <div className="bg-slate-900 rounded-2xl shadow-2xl m-4 w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between border-b border-blue-500/30">
          <div>
            <h2 className="text-white text-2xl font-bold">技能卡工坊</h2>
            <p className="text-blue-200 text-sm mt-1">创建和配置自定义技能卡</p>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSaveDraft}
              className="bg-green-600 hover:bg-green-700"
            >
              保存草稿
            </Button>
            <Button
              type="primary"
              onClick={handlePublish}
              className="bg-blue-600 hover:bg-blue-700"
            >
              发布
            </Button>
            <Button onClick={onClose}>关闭</Button>
          </Space>
        </div>

        {/* 内容区域 - 三列布局 */}
        <div className="flex-1 overflow-hidden flex">
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              className="w-full h-full overflow-auto"
              initialValues={{
                kernel_type: 'ai_model',
                temperature: 1.0,
                max_tokens: 2000,
              }}
            >
              {/* 主编辑区域 */}
              <div className="grid grid-cols-12 gap-6 p-6 h-full overflow-auto">
                {/* 左列：组件库和基础配置 */}
                <div className="col-span-3 space-y-6 border-r border-slate-700 pr-6">
                  <div>
                    <h3 className="text-white font-semibold mb-4">基础信息</h3>
                    <div className="space-y-4">
                      <Form.Item
                        name="name"
                        label={<span className="text-white">技能名称</span>}
                        rules={[{ required: true, message: '请输入技能名称' }]}
                      >
                        <Input placeholder="例如：小红书笔记生成器" className="bg-slate-800 border-slate-600 text-white" />
                      </Form.Item>

                      <Form.Item
                        name="category"
                        label={<span className="text-white">分类</span>}
                        rules={[{ required: true, message: '请选择分类' }]}
                      >
                        <Select
                          placeholder="选择分类"
                          options={SKILL_CATEGORIES}
                          className="[&_.ant-select-selector]:bg-slate-800 [&_.ant-select-selector]:border-slate-600"
                        />
                      </Form.Item>

                      <Form.Item
                        name="description"
                        label={<span className="text-white">描述</span>}
                        rules={[{ required: true, message: '请输入技能描述' }]}
                      >
                        <Input.TextArea rows={4} placeholder="描述这个技能的功能和用途" className="bg-slate-800 border-slate-600 text-white" />
                      </Form.Item>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-4">内核配置</h3>
                    <Form.Item
                      name="kernel_type"
                      label={<span className="text-white">类型</span>}
                    >
                      <Select
                        placeholder="选择内核类型"
                        options={[
                          { label: 'AI模型', value: 'ai_model' },
                          { label: '代码逻辑', value: 'code_logic' },
                        ]}
                        onChange={(val) => setKernelType(val)}
                        className="[&_.ant-select-selector]:bg-slate-800 [&_.ant-select-selector]:border-slate-600"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* 中列：编辑区域 */}
                <div className="col-span-5 space-y-6">
                  {kernelType === 'ai_model' ? (
                    // AI模型配置
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        AI模型配置
                      </h3>

                      <Form.Item
                        name="ai_model"
                        label={<span className="text-white">选择模型</span>}
                        rules={[{ required: true, message: '请选择模型' }]}
                      >
                        <Select
                          placeholder="选择模型"
                          options={AI_MODELS}
                          className="[&_.ant-select-selector]:bg-slate-700 [&_.ant-select-selector]:border-slate-600"
                        />
                      </Form.Item>

                      <Form.Item
                        name="system_prompt"
                        label={<span className="text-white">系统提示词</span>}
                        rules={[{ required: true, message: '请输入系统提示词' }]}
                      >
                        <Input.TextArea
                          rows={5}
                          placeholder={PROMPT_EXAMPLES.system}
                          className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                        />
                      </Form.Item>

                      <Form.Item
                        name="user_prompt_template"
                        label={<span className="text-white">用户提示词模板</span>}
                        rules={[{ required: true, message: '请输入用户提示词模板' }]}
                      >
                        <Input.TextArea
                          rows={5}
                          placeholder={PROMPT_EXAMPLES.user}
                          className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                        />
                      </Form.Item>

                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                          name="temperature"
                          label={<span className="text-white">温度值</span>}
                        >
                          <InputNumber
                            min={0}
                            max={2}
                            step={0.1}
                            className="w-full [&_.ant-input-number-input]:bg-slate-700 [&_.ant-input-number-input]:border-slate-600 [&_.ant-input-number-input]:text-white"
                          />
                        </Form.Item>

                        <Form.Item
                          name="max_tokens"
                          label={<span className="text-white">最大Token</span>}
                        >
                          <InputNumber
                            min={1}
                            max={10000}
                            className="w-full [&_.ant-input-number-input]:bg-slate-700 [&_.ant-input-number-input]:border-slate-600 [&_.ant-input-number-input]:text-white"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  ) : (
                    // 代码逻辑配置
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        代码逻辑配置
                      </h3>

                      <Form.Item
                        name="code_runtime"
                        label={<span className="text-white">运行时环境</span>}
                        rules={[{ required: true, message: '请选择运行时' }]}
                      >
                        <Select
                          placeholder="选择运行时"
                          options={CODE_RUNTIMES}
                          className="[&_.ant-select-selector]:bg-slate-700 [&_.ant-select-selector]:border-slate-600"
                        />
                      </Form.Item>

                      <Form.Item
                        name="code"
                        label={<span className="text-white">代码编辑器</span>}
                        rules={[{ required: true, message: '请输入代码' }]}
                      >
                        <Input.TextArea
                          rows={10}
                          placeholder="# 在此输入你的代码"
                          className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                        />
                      </Form.Item>

                      <Form.Item
                        name="dependencies"
                        label={<span className="text-white">依赖包</span>}
                      >
                        <Input
                          placeholder="使用逗号分隔多个依赖：requests,pandas,numpy"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </Form.Item>
                    </div>
                  )}

                  {/* Schema 编辑器 */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <Tabs
                      defaultActiveKey="input"
                      items={[
                        {
                          key: 'input',
                          label: <span className="text-white">输入定义</span>,
                          children: (
                            <div className="space-y-4">
                              {inputFields.map((field) => (
                                <div key={field.key} className="flex gap-2">
                                  <Input
                                    placeholder="字段名"
                                    value={field.title}
                                    onChange={(e) => {
                                      setInputFields(
                                        inputFields.map((f) =>
                                          f.key === field.key
                                            ? { ...f, title: e.target.value }
                                            : f
                                        )
                                      )
                                    }}
                                    className="flex-1 bg-slate-700 border-slate-600 text-white"
                                  />
                                  <Select
                                    value={field.type}
                                    options={[
                                      { label: '字符串', value: 'string' },
                                      { label: '数字', value: 'number' },
                                      { label: '布尔', value: 'boolean' },
                                      { label: '数组', value: 'array' },
                                      { label: '对象', value: 'object' },
                                    ]}
                                    onChange={(val) => {
                                      setInputFields(
                                        inputFields.map((f) =>
                                          f.key === field.key ? { ...f, type: val } : f
                                        )
                                      )
                                    }}
                                    className="w-32 [&_.ant-select-selector]:bg-slate-700 [&_.ant-select-selector]:border-slate-600"
                                  />
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeInputField(field.key)}
                                  />
                                </div>
                              ))}
                              <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addInputField}
                                className="w-full text-blue-400"
                              >
                                添加字段
                              </Button>
                            </div>
                          ),
                        },
                        {
                          key: 'output',
                          label: <span className="text-white">输出定义</span>,
                          children: (
                            <div className="space-y-4">
                              {outputFields.map((field) => (
                                <div key={field.key} className="flex gap-2">
                                  <Input
                                    placeholder="字段名"
                                    value={field.title}
                                    onChange={(e) => {
                                      setOutputFields(
                                        outputFields.map((f) =>
                                          f.key === field.key
                                            ? { ...f, title: e.target.value }
                                            : f
                                        )
                                      )
                                    }}
                                    className="flex-1 bg-slate-700 border-slate-600 text-white"
                                  />
                                  <Select
                                    value={field.type}
                                    options={[
                                      { label: '字符串', value: 'string' },
                                      { label: '数字', value: 'number' },
                                      { label: '布尔', value: 'boolean' },
                                      { label: '数组', value: 'array' },
                                      { label: '对象', value: 'object' },
                                    ]}
                                    onChange={(val) => {
                                      setOutputFields(
                                        outputFields.map((f) =>
                                          f.key === field.key ? { ...f, type: val } : f
                                        )
                                      )
                                    }}
                                    className="w-32 [&_.ant-select-selector]:bg-slate-700 [&_.ant-select-selector]:border-slate-600"
                                  />
                                  <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeOutputField(field.key)}
                                  />
                                </div>
                              ))}
                              <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addOutputField}
                                className="w-full text-blue-400"
                              >
                                添加字段
                              </Button>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* 右列：测试面板 */}
                <div className="col-span-4 space-y-6">
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      在线测试
                    </h3>

                    <Form.Item
                      name="test_input"
                      label={<span className="text-white text-sm">测试输入 (JSON格式)</span>}
                    >
                      <Input.TextArea
                        rows={8}
                        placeholder='{"title": "测试", "content": "示例内容"}'
                        className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      loading={testLoading}
                      onClick={handleTest}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                      block
                    >
                      执行测试
                    </Button>
                  </div>

                  {/* 测试结果 */}
                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800 rounded-xl p-6 border border-green-600/50"
                    >
                      <h4 className="text-green-400 font-semibold mb-3">✓ 测试结果</h4>
                      <div className="space-y-2 text-sm">
                        <div className="text-white/70">
                          执行时间: <span className="text-white">{testResult.executionTime.toFixed(2)}ms</span>
                        </div>
                        <div className="text-white/70">
                          状态: <span className="text-green-400">{testResult.status}</span>
                        </div>
                      </div>

                      <div className="mt-4 bg-slate-900 rounded-lg p-3">
                        <p className="text-white/70 text-xs mb-2">输出数据：</p>
                        <pre className="text-green-400 text-xs overflow-auto max-h-48">
                          {JSON.stringify(testResult.output, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}

                  {/* 提示词示例 */}
                  <div className="bg-blue-900/30 border border-blue-600/50 rounded-xl p-4">
                    <h4 className="text-blue-300 font-semibold text-sm mb-3">💡 提示词语法</h4>
                    <div className="text-xs text-blue-200 space-y-2">
                      <p>
                        <code className="bg-slate-900 px-2 py-1 rounded">{'{{input.field}}'}</code> 引用输入字段
                      </p>
                      <p>
                        <code className="bg-slate-900 px-2 py-1 rounded">{'{{#if condition}}'}</code> 条件分支
                      </p>
                      <p>
                        <code className="bg-slate-900 px-2 py-1 rounded">{'{{items | join: ", "}}'}</code> 数组过滤
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </Spin>
        </div>
      </div>
    </motion.div>
  )
}
