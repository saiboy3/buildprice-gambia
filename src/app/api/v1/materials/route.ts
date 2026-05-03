import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function validateApiKey(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization') ?? ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!key) return false

  const record = await prisma.apiKey.findUnique({ where: { key } })
  if (!record || !record.active) return false

  await prisma.apiKey.update({ where: { id: record.id }, data: { lastUsed: new Date() } })
  return true
}

export async function GET(req: NextRequest) {
  try {
    const valid = await validateApiKey(req)
    if (!valid) {
      return NextResponse.json({ ok: false, message: 'Invalid API key' }, { status: 401 })
    }

    const materials = await prisma.material.findMany({
      include: {
        category: { select: { id: true, name: true } },
        prices: {
          where: { stockStatus: 'AVAILABLE' },
          orderBy: { price: 'asc' },
          take: 1,
          select: { price: true, unit: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const data = materials.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category?.name ?? null,
      lowestPrice: m.prices[0]?.price ?? null,
      unit: m.prices[0]?.unit ?? null,
    }))

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
