import { createContext, useContext, useState } from "react"
import apiFetch from "../services/api"

const AuthContext = createContext(null)

function readStoredUser() {
  const raw = localStorage.getItem("user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())

  async function login(email, password) {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    setUser(data.user)

    return data.user
  }

  async function register(data) {
    return apiFetch("/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async function logout() {
    try {
      await apiFetch("/logout", { method: "POST" })
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
    }
  }

  function updateUser(updatedFields) {
    setUser((current) => {
      const next = { ...current, ...updatedFields }
      localStorage.setItem("user", JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}
