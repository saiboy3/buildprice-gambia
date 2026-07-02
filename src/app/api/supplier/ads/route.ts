import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!user || user.role !== 'SUPPLIER') return NextResponse.json({ ok: false }, { status: 401 })
  const supplier = await prisma.supplier.findUnique({ where: { userId: user.id } })
  if (!supplier) return NextResponse.json({ ok: false }, { status: 404 })
  const ads = await prisma.promotedListing.findMany({
    where: { supplierId: supplier.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ ok: true, data: ads })
}

export async function POST(req: NextRequest) {
  const user = getTokenFromRequest(req)
  if (!user || user.role !== 'SUPPLIER') return NextResponse.json({ ok: false }, { status: 401 })
  const supplier = await prisma.supplier.findUnique({ where: { userId: user.id } })
  if (!supplier) return NextResponse.json({ ok: false }, { status: 404 })
  const { headline, description, placement, budget, cpc, startsAt, endsAt } = await req.json()
  const ad = await prisma.promotedListing.create({
    data: {
      supplierId: supplier.id, headline, description,
      placement: placement ?? 'SEARCH',
      budget: Number(budget), cpc: Number(cpc),
      startsAt: new Date(startsAt), endsAt: new Date(endsAt),
      active: true,
    },
  })
  return NextResponse.json({ ok: true, data: ad }, { status: 201 })
}
