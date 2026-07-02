import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const now = new Date()
    const { searchParams } = new URL(req.url)
    const placement = searchParams.get('placement')
    const location  = searchParams.get('location')

    const listings = await prisma.promotedListing.findMany({
      where: {
        endsAt: { gt: now },
        startsAt: { lte: now },
        active: true,
        ...(placement ? { placement } : {}),
        // location targeting: show untargeted ads to everyone, and location-targeted
        // ads only to visitors from a matching location
        ...(location ? { OR: [{ targetLocation: null }, { targetLocation: '' }, { targetLocation: location }] } : {}),
      },
      include: {
        supplier: {
          select: { id: true, name: true, location: true, avgRating: true, reviewCount: true, verified: true },
        },
      },
      orderBy: { startsAt: 'desc' },
    })

    // Rank location-matched ads first, then untargeted ads
    const ranked = location
      ? [...listings].sort((a, b) => {
          const aMatch = a.targetLocation === location ? 1 : 0
          const bMatch = b.targetLocation === location ? 1 : 0
          return bMatch - aMatch
        })
      : listings

    return NextResponse.json({ ok: true, data: ranked })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
