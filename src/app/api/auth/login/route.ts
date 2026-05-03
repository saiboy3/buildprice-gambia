import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signToken } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()
    if (!phone || !password) return err('phone and password are required')

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
