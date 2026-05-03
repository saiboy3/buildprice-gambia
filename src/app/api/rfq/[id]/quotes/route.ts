import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req)

    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id } })
    if (!rfq) {
      return NextResponse.json({ ok: false, message: 'RFQ not found' }, { status: 404 })
    }
    if (rfq.userId !== tokenUser.id && tokenUser.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const quotes = await prisma.rFQQuote.findMany({
      where: { rfqId: params.id },
      include: { supplier: { select: { id: true, name: true, location: true, avgRating: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: quotes })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req, ['SUPPLIER', 'ADMIN'])
    const supplierId = tokenUser.supplierId
    if (!supplierId) {
      return NextResponse.json({ ok: false, message: 'No supplier profile linked' }, { status: 403 })
    }

    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id } })
    if (!rfq) {
      return NextResponse.json({ ok: false, message: 'RFQ not found' }, { status: 404 })
    }
    if (rfq.status !== 'OPEN') {
      return NextResponse.json({ ok: false, message: 'RFQ is no longer open' }, { status: 400 })
    }

    const existing = await prisma.rFQQuote.findUnique({
      where: { rfqId_supplierId: { rfqId: params.id, supplierId } },
    })
    if (existing) {
      return NextResponse.json({ ok: false, message: 'You have already submitted a quote for this RFQ' }, { status: 409 })
    }

    const { totalPrice, message } = await req.json()
    if (totalPrice === undefined) {
      return NextResponse.json({ ok: false, message: 'totalPrice is required' }, { status: 400 })
    }

    const quote = await prisma.rFQQuote.create({
      data: { rfqId: params.id, supplierId, totalPrice, message, status: 'PENDING' },
    })
    return NextResponse.json({ ok: true, data: quote }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
