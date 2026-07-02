import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

const PHONE_RE = /^\+?\d{7,15}$/

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password, email, role } = await req.json()

    if (!name || !phone || !password) return err('name, phone, and password are required')
    if (!PHONE_RE.test(phone)) return err('Enter a valid phone number (7-15 digits)')
    if (password.length < 8) return err('Password must be at least 8 characters')
    if (!['USER', 'SUPPLIER', 'CONTRACTOR'].includes(role ?? 'USER')) return err('Invalid role')

    // Rate limit registrations by IP: max 10 new accounts per hour.
    const ip = getClientIp(req)
    if (await isRateLimited(`register:ip:${ip}`, 10, 60 * 60 * 1000)) {
      return err('Too many registration attempts. Please try again later.', 429)
    }

    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) return err('Phone number already registered', 409)

    const hash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, phone, email, password: hash, role: role ?? 'USER' },
    })

    let contractorId: string | undefined
    if (user.role === 'CONTRACTOR') {
      const contractor = await prisma.contractor.findUnique({ where: { userId: user.id } })
      contractorId = contractor?.id
    }

    await log('REGISTER', user.id, `New ${user.role} registered`)
    const token = signToken({ id: user.id, phone: user.phone, role: user.role as any, contractorId })
    return ok({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, contractorId } }, 201)
  } catch (e) {
    return handleError(e)
  }
}
