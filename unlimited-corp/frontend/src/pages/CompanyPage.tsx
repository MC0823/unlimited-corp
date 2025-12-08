import { useState, useEffect, useCallback } from 'react'
import { Card, Form, Input, Button, message, Spin, Layout } from 'antd'
import { companyApi } from '@/api'
import type { Company, CreateCompanyParams } from '@/types'
import MainLayout from '@/components/common/MainLayout'

interface ApiError {
  response?: {
    status?: number
    data?: {
      message?: string
    }
  }
}

const { Content } = Layout

export default function CompanyPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [company, setCompany] = useState<Company | null>(null)
  const [fetching, setFetching] = useState(true)

  const fetchCompany = useCallback(async () => {
    try {
      const response = await companyApi.getMyCompany()
      if (response.code === 0 || response.code === 200) {
        setCompany(response.data)
        form.setFieldsValue(response.data)
      }
    } catch (err) {
      const error = err as ApiError
      if (error.response?.status !== 404) {
        message.error('获取公司信息失败')
      }
    } finally {
      setFetching(false)
    }
  }, [form])

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  const onFinish = async (values: CreateCompanyParams) => {
    setLoading(true)
    try {
      if (company) {
        const response = await companyApi.updateCompany(company.id, values)
        if (response.code === 0 || response.code === 200) {
          message.success('更新成功')
          setCompany(response.data)
        }
      } else {
        const response = await companyApi.createCompany(values)
        if (response.code === 0 || response.code === 201) {
          message.success('创建成功')
          setCompany(response.data)
        }
      }
    } catch (err) {
      const error = err as ApiError
      message.error(error.response?.data?.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <MainLayout>
        <Content>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Content>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Content>
        <Card title={company ? '公司信息' : '创建公司'}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="max-w-2xl"
          >
            <Form.Item
              name="name"
              label="公司名称"
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input placeholder="请输入公司名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="公司简介"
            >
              <Input.TextArea rows={4} placeholder="请输入公司简介" />
            </Form.Item>

            <Form.Item
              name="logo_url"
              label="Logo URL"
            >
              <Input placeholder="请输入Logo URL" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {company ? '更新' : '创建'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </MainLayout>
  )
}
