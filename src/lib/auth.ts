// Simple auth utility for managing authentication state
const AUTH_KEY = 'nhis_fraud_auth'

export interface AuthState {
  isAuthenticated: boolean
  email?: string
}

export function getAuth(): AuthState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false }
  }
  const stored = localStorage.getItem(AUTH_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { isAuthenticated: false }
    }
  }
  return { isAuthenticated: false }
}

export function setAuth(email: string) {
  if (typeof window === 'undefined') return
  const authState: AuthState = {
    isAuthenticated: true,
    email,
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(authState))
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AUTH_KEY)
}

export function isAuthenticated(): boolean {
  return getAuth().isAuthenticated
}

