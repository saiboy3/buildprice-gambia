import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password, email, role } = await req.json()

    if (!name || !phone || !password) return err('name, phone, and password are required')
    if (password.length < 6) return err('Password must be at least 6 characters')
    if (!['USER', 'SUPPLIER'].includes(role ?? 'USER')) return err('Invalid role')

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) return err('Phone number already registered', 409)

    const hash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, phone, email, password: hash, role: role ?? 'USER' },
    })

    await log('REGISTER', user.id, `New ${user.role} registered`)
    const token = signToken({ id: user.id, phone: user.phone, role: user.role as any })
    return ok({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } }, 201)
  } catch (e) {
    return handleError(e)
  }
}
