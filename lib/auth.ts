import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "./prisma"
import type { User, Role } from "./types"

const AUTH_COOKIE_NAME = "auth_session"

// Simple hash function for passwords (in production, use bcrypt)
// This is a simplified version - in real production, use proper bcrypt
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + process.env.AUTH_SECRET)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Generate a secure random token
export function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

// Hash a token for storage
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Create a session for a user
export async function createSession(userId: string): Promise<string> {
  const token = generateToken()
  const tokenHash = await hashToken(token)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (Number(process.env.SESSION_EXPIRY_DAYS) || 7))

  await prisma.session.create({
    data: {
      userId,
      token: tokenHash,
      expiresAt,
    },
  })

  return token
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * (Number(process.env.SESSION_EXPIRY_DAYS) || 7),
  })
}

// Get current session from cookie
export async function getSession(): Promise<{ user: User; sessionId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) return null

  const tokenHash = await hashToken(token)

  const session = await prisma.session.findUnique({
    where: { token: tokenHash },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  const { passwordHash: _, ...userWithoutPassword } = session.user
  return {
    user: userWithoutPassword as User,
    sessionId: session.id,
  }
}

// Get current user or redirect to login
export async function getCurrentUser(): Promise<User> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session.user
}

// Get current user with role check
export async function requireRole(allowedRoles: Role[]): Promise<User> {
  const user = await getCurrentUser()
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized")
  }
  return user
}

// Logout - destroy session
export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (token) {
    const tokenHash = await hashToken(token)
    await prisma.session.deleteMany({ where: { token: tokenHash } })
  }

  cookieStore.delete(AUTH_COOKIE_NAME)
}

// Login user
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!user) {
    return { success: false, error: "Invalid email or password" }
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return { success: false, error: "Invalid email or password" }
  }

  const token = await createSession(user.id)
  await setAuthCookie(token)

  return { success: true }
}

// Register user (for creating providers by owner)
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: Role,
  username?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, ...(username ? [{ username }] : [])],
    },
  })

  if (existingUser) {
    return { success: false, error: "Email or username already exists" }
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      username,
      passwordHash,
      name,
      role,
    },
  })

  const { passwordHash: _, ...userWithoutPassword } = user
  return { success: true, user: userWithoutPassword as User }
}

// Magic link functions
export async function createMagicLink(caseId: string): Promise<string> {
  const token = generateToken()
  const tokenHash = await hashToken(token)
  
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + (Number(process.env.MAGIC_LINK_EXPIRY_HOURS) || 72))

  await prisma.magicLink.create({
    data: {
      tokenHash,
      caseId,
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/client/${token}`
}

export async function validateMagicLink(token: string) {
  const tokenHash = await hashToken(token)

  const magicLink = await prisma.magicLink.findUnique({
    where: { tokenHash },
    include: { case: true },
  })

  if (!magicLink) {
    return { valid: false, error: "Invalid link" }
  }

  if (magicLink.revokedAt) {
    return { valid: false, error: "This link has been revoked" }
  }

  if (magicLink.expiresAt && magicLink.expiresAt < new Date()) {
    return { valid: false, error: "This link has expired" }
  }

  return { valid: true, magicLink, case: magicLink.case }
}

export async function completeMagicLinkIntake(
  token: string,
  data: { firstName: string; lastName: string; email: string; phone: string }
) {
  const tokenHash = await hashToken(token)

  const magicLink = await prisma.magicLink.update({
    where: { tokenHash },
    data: {
      clientFirstName: data.firstName,
      clientLastName: data.lastName,
      clientEmail: data.email,
      clientPhone: data.phone,
      intakeCompleted: true,
      usedAt: new Date(),
    },
    include: { case: true },
  })

  // Update case with client info if not already set
  if (!magicLink.case.firstName) {
    await prisma.case.update({
      where: { id: magicLink.caseId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        patientName: `${data.firstName} ${data.lastName}`,
      },
    })
  }

  return magicLink
}
