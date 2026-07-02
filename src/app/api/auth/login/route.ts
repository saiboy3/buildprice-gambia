import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signToken } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()
    if (!phone || !password) return err('phone and password are required')

    // Rate limit by phone AND by IP: max 8 attempts per 10 minutes each.
    const ip = getClientIp(req)
    const [phoneLimited, ipLimited] = await Promise.all([
      isRateLimited(`login:phone:${phone}`, 8, 10 * 60 * 1000),
      isRateLimited(`login:ip:${ip}`, 20, 10 * 60 * 1000),
    ])
    if (phoneLimited || ipLimited) {
      return err('Too many login attempts. Please try again in a few minutes.', 429)
    }

    const user = await prisma.user.findUnique({ where: { phone }, include: { supplier: true } })
    if (!user) return err('Invalid credentials', 401)

    const valid = await comparePassword(password, user.password)
    if (!valid) return err('Invalid credentials', 401)

    let contractorId: string | undefined
    if (user.role === 'CONTRACTOR') {
      const contractor = await prisma.contractor.findUnique({ where: { userId: user.id } })
      contractorId = contractor?.id
    }

    await log('LOGIN', user.id)
    const token = signToken({
      id: user.id,
      phone: user.phone,
      role: user.role as any,
      supplierId: user.supplier?.id,
      contractorId,
    })

    return ok({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        supplierId: user.supplier?.id,
        contractorId,
      },
    })
  } catch (e) {
    return handleError(e)
  }
}
