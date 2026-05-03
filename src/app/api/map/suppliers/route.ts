import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        verified: true,
        lat: { not: null },
        lng: { not: null },
      },
      select: {
        id: true,
        name: true,
        location: true,
        lat: true,
        lng: true,
        verified: true,
        avgRating: true,
        reviewCount: true,
        _count: { select: { prices: true } },
      },
    })

    const data = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      location: s.location,
      lat: s.lat,
      lng: s.lng,
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
