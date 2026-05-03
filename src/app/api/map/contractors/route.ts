import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const contractors = await prisma.contractor.findMany({
      where: {
        lat: { not: null },
        lng: { not: null },
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        location: true,
        lat: true,
        lng: true,
        verified: true,
        avgRating: true,
      },
    })

    return NextResponse.json({ ok: true, data: contractors })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
