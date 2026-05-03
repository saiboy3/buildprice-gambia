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

    const suppliers = await prisma.supplier.findMany({
      where: { verified: true },
      include: {
        _count: { select: { prices: true } },
      },
      orderBy: { name: 'asc' },
    })

    const data = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      location: s.location,
      contact: s.contact,
      verified: s.verified,
      avgRating: s.avgRating,
      reviewCount: s.reviewCount,
      priceCount: s._count.prices,
    }))

    return NextResponse.json({ ok: true, data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
