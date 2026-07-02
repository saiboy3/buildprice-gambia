import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { promotedListingId, sessionId, page } = await req.json()
    if (!promotedListingId) return NextResponse.json({ ok: false })
    await Promise.all([
      prisma.adImpression.create({ data: { promotedListingId, sessionId, page } }),
      prisma.promotedListing.update({ where: { id: promotedListingId }, data: { impressions: { increment: 1 } } }),
    ])
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }) }
}
