import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authApi, MeResponse, setAuthToken } from '../api/client'

const TOKEN_KEY = 'token'

type AuthContextType = {
  user: MeResponse | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, role: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore token from AsyncStorage; if present, set on client and fetch /me.
  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY).then((token) => {
      if (!token) {
        setLoading(false)
        return
      }
      setAuthToken(token)
      authApi.me()
        .then((r) => setUser(r.data))
        .catch(() => AsyncStorage.removeItem(TOKEN_KEY))
        .finally(() => setLoading(false))
    })
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password })
    await AsyncStorage.setItem(TOKEN_KEY, data.token)
    setAuthToken(data.token)
    setUser({ id: data.userId, email: data.email, fullName: data.fullName, role: data.role })
  }

  const register = async (email: string, password: string, fullName: string, role: string) => {
    const { data } = await authApi.register({ email, password, fullName, role })
    await AsyncStorage.setItem(TOKEN_KEY, data.token)
    setAuthToken(data.token)
    setUser({ id: data.userId, email: data.email, fullName: data.fullName, role: data.role })
  }

  const logout = () => {
    AsyncStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
