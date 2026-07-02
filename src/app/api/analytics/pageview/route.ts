import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { page, referrer, sessionId, device, userId } = await req.json()
    if (!page || !sessionId) return NextResponse.json({ ok: false })
    await prisma.pageView.create({ data: { page, referrer, sessionId, device, userId } })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }) }
}
