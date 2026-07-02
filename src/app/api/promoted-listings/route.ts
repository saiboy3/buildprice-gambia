import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const now = new Date()
    const { searchParams } = new URL(req.url)
    const placement = searchParams.get('placement')

    const listings = await prisma.promotedListing.findMany({
      where: {
        endsAt: { gt: now },
        startsAt: { lte: now },
        active: true,
        ...(placement ? { placement } : {}),
      },
      include: {
        supplier: {
          select: { id: true, name: true, location: true, avgRating: true, reviewCount: true, verified: true },
        },
      },
      orderBy: { startsAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: listings })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
