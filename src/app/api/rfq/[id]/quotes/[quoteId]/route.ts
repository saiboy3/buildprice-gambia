import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; quoteId: string } }
) {
  try {
    const tokenUser = requireAuth(req)

    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id } })
    if (!rfq) {
      return NextResponse.json({ ok: false, message: 'RFQ not found' }, { status: 404 })
    }
    if (rfq.userId !== tokenUser.id) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const quote = await prisma.rFQQuote.findUnique({ where: { id: params.quoteId } })
    if (!quote || quote.rfqId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Quote not found' }, { status: 404 })
    }

    const { status } = await req.json()
    if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ ok: false, message: 'status must be ACCEPTED or REJECTED' }, { status: 400 })
    }

    const updatedQuote = await prisma.rFQQuote.update({
      where: { id: params.quoteId },
      data: { status },
    })

    if (status === 'ACCEPTED') {
      // Award the RFQ and reject all other quotes
      await prisma.rFQ.update({
        where: { id: params.id },
        data: { status: 'AWARDED' },
      })
      await prisma.rFQQuote.updateMany({
        where: { rfqId: params.id, id: { not: params.quoteId } },
        data: { status: 'REJECTED' },
      })
    }

    return NextResponse.json({ ok: true, data: updatedQuote })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
