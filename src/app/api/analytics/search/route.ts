import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { query, results, sessionId, userId, location } = await req.json()
    if (!query) return NextResponse.json({ ok: false })
    await prisma.searchEvent.create({ data: { query: query.toLowerCase().trim(), results: results ?? 0, sessionId, userId, location } })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ ok: false }) }
}
