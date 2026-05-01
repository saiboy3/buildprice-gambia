import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const location = searchParams.get('location') ?? ''
    const verified = searchParams.get('verified')

    const suppliers = await prisma.supplier.findMany({
      where: {
        ...(location ? { location: { contains: location } } : {}),
        ...(verified !== null ? { verified: verified === 'true' } : {}),
      },
      include: {
        prices: {
          include: { material: true },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    })

    return ok(suppliers)
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ['ADMIN', 'SUPPLIER'])
    const { name, location, contact } = await req.json()
    if (!name || !location || !contact) return err('name, location, and contact required')

    const existing = await prisma.supplier.findUnique({ where: { userId: user.id } })
    if (existing) return err('Supplier profile already exists', 409)

    const supplier = await prisma.supplier.create({
      data: { name, location, contact, userId: user.id },
    })
    await log('CREATE_SUPPLIER', user.id, supplier.name)
    return ok(supplier, 201)
  } catch (e) {
    return handleError(e)
  }
}
