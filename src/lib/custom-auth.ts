import { SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from './db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dashboard-uskup-surabaya-secret')

interface JWTPayload {
  userId: string
  email: string
  name: string
  role: string
  exp: number
}

export async function createJWT(user: { id: string; email: string; name: string; role: string }) {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dashboard-uskup-surabaya-secret')
  const alg = 'HS256'

  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dashboard-uskup-surabaya-secret')
    const { payload } = await jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export async function getCurrentUserFromRequest(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const payload = await verifyJWT(token)
    if (!payload) {
      return null
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

export async function clearAuthCookie(response: NextResponse) {
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}