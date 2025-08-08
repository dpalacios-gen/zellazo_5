import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type User = { id: number; email: string; role?: 'ADMIN' | 'CLIENTE' }
type AuthState = { token: string | null; user: User | null }

type AuthContextValue = {
  token: string | null
  user: User | null
  signIn: (token: string, user: User) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth')
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState
        setToken(parsed.token || null)
        setUser(parsed.user || null)
      }
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    signIn: (t, u) => {
      setToken(t)
      setUser(u)
      localStorage.setItem('auth', JSON.stringify({ token: t, user: u }))
    },
    signOut: () => {
      setToken(null)
      setUser(null)
      localStorage.removeItem('auth')
    },
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


