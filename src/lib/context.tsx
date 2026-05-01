'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type User = {
  id: string
  name: string
  phone: string
  role: 'USER' | 'SUPPLIER' | 'ADMIN'
  supplierId?: string
}

type AuthCtx = {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAdmin: boolean
  isSupplier: boolean
}

const Ctx = createContext<AuthCtx>({
  user: null, token: null,
  login: () => {}, logout: () => {},
  isAdmin: false, isSupplier: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem('bpg_token')
      const u = localStorage.getItem('bpg_user')
      if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    } catch {}
  }, [])

  const login = (t: string, u: User) => {
    setToken(t); setUser(u)
    localStorage.setItem('bpg_token', t)
    localStorage.setItem('bpg_user', JSON.stringify(u))
  }

  const logout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem('bpg_token')
    localStorage.removeItem('bpg_user')
  }

  return (
    <Ctx.Provider value={{ user, token, login, logout, isAdmin: user?.role === 'ADMIN', isSupplier: user?.role === 'SUPPLIER' || user?.role === 'ADMIN' }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
