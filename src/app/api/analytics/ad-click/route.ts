import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { promotedListingId, sessionId } = await req.json()
    if (!promotedListingId) return NextResponse.json({ ok: false })
    const listing = await prisma.promotedListing.findUnique({ where: { id: promotedListingId } })
    if (!listing) return NextResponse.json({ ok: false })
    const newSpent = listing.spent + listing.cpc
    const stillActive = newSpent < listing.budget
    await Promise.all([
      prisma.adClick.create({ data: { promotedListingId, sessionId } }),
      prisma.promotedListing.update({
        where: { id: promotedListingId },
        data: { clicks: { increment: 1 }, spent: newSpent, active: stillActive },
      }),
    ])
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }) }
}
