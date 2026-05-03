import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const materialId = searchParams.get('materialId')
    if (!materialId) {
      return NextResponse.json({ ok: false, message: 'materialId is required' }, { status: 400 })
    }

    const since = new Date()
    since.setDate(since.getDate() - 90)

    const history = await prisma.priceHistory.findMany({
      where: {
        materialId,
        changedAt: { gte: since },
      },
      include: {
        supplier: { select: { id: true, name: true, location: true } },
        material: { select: { id: true, name: true } },
      },
      orderBy: { changedAt: 'asc' },
    })

    // Group by supplierId
    const grouped: Record<string, { supplier: { id: string; name: string; location: string }; history: typeof history }> = {}
    for (const entry of history) {
      if (!grouped[entry.supplierId]) {
        grouped[entry.supplierId] = { supplier: entry.supplier, history: [] }
      }
      grouped[entry.supplierId].history.push(entry)
    }

    return NextResponse.json({ ok: true, data: grouped })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
