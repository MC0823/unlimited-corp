import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import type { User, TokenPair } from '@/types'

// Mock data
const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  nickname: 'TestUser',
  avatar_url: 'https://example.com/avatar.png',
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockToken: TokenPair = {
  access_token: 'access-token-123',
  refresh_token: 'refresh-token-456',
  expires_in: 3600,
}

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  })

  it('should have initial state', () => {
    const state = useAuthStore.getState()
    
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('should set user', () => {
    useAuthStore.getState().setUser(mockUser)

    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('should set token', () => {
    useAuthStore.getState().setToken(mockToken)

    expect(useAuthStore.getState().token).toEqual(mockToken)
  })

  it('should login with user and token', () => {
    useAuthStore.getState().login(mockUser, mockToken)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.token).toEqual(mockToken)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should logout', () => {
    // First login
    useAuthStore.getState().login(mockUser, mockToken)

    // Then logout
    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
