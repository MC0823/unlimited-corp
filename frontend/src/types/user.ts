// 用户相关类型
export interface User {
  id: string
  email: string
  nickname: string
  avatar_url: string
  status: 'active' | 'inactive' | 'banned'
  created_at: string
  updated_at: string
}

// Token相关
export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_in: number
}

// 登录响应
export interface LoginResponse {
  user: User
  token: TokenPair
}

// 注册响应
export interface RegisterResponse {
  user: User
  token: TokenPair
}
