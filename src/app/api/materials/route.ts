import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const category = searchParams.get('category') ?? ''

    const materials = await prisma.material.findMany({
      where: {
        ...(search ? { name: { contains: search } } : {}),
        ...(category ? { categoryId: category } : {}),
      },
      include: {
        category: true,
        prices: {
          include: { supplier: { select: { name: true, location: true, contact: true, verified: true } } },
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    return ok(materials)
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const { name, categoryId } = await req.json()
    if (!name || !categoryId) return err('name and categoryId required')

    const material = await prisma.material.create({ data: { name, categoryId }, include: { category: true } })
    await log('CREATE_MATERIAL', undefined, material.name)
    return ok(material, 201)
  } catch (e) {
    return handleError(e)
  }
}
