"use server"

import { redirect } from "next/navigation"
import { loginUser, registerUser, destroySession, requireRole } from "@/lib/auth"
import { revalidateTag } from "next/cache"
import type { Role } from "@/lib/types"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const result = await loginUser(email, password)

  if (!result.success) {
    return { error: result.error }
  }

  redirect("/dashboard")
}

export async function logout() {
  await destroySession()
  redirect("/login")
}

export async function createProvider(formData: FormData) {
  await requireRole(["OWNER"])

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const username = formData.get("username") as string | undefined

  if (!email || !password || !name) {
    return { error: "Email, password, and name are required" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  const result = await registerUser(
    email,
    password,
    name,
    "PROVIDER" as Role,
    username || undefined
  )

  if (!result.success) {
    return { error: result.error }
  }

  revalidateTag("providers", "max")
  return { success: true, user: result.user }
}

export async function createOwner(formData: FormData) {
  // This should only be used for initial setup
  // In production, you might want to restrict this further
  
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "Email, password, and name are required" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  const result = await registerUser(email, password, name, "OWNER" as Role)

  if (!result.success) {
    return { error: result.error }
  }

  // Auto-login after creating owner
  const loginResult = await loginUser(email, password)
  
  if (loginResult.success) {
    redirect("/dashboard")
  }

  return { success: true }
}
