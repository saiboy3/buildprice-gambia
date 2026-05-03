import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

export type JwtPayload = {
  id: string
  phone: string
  role: 'USER' | 'SUPPLIER' | 'ADMIN' | 'CONTRACTOR'
  supplierId?: string
  contractorId?: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(req: NextRequest): JwtPayload | null {
  const auth = req.headers.get('authorization') ?? ''
  const cookie = req.cookies.get('token')?.value ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : cookie
  return token ? verifyToken(token) : null
}

export function requireAuth(req: NextRequest, roles?: string[]): JwtPayload {
  const user = getTokenFromRequest(req)
  if (!user) throw new AuthError('Unauthorized', 401)
  if (roles && !roles.includes(user.role)) throw new AuthError('Forbidden', 403)
  return user
}

export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}
