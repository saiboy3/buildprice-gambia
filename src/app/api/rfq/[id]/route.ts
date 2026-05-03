import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req)

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: {
        quotes: {
          include: { supplier: { select: { id: true, name: true, location: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!rfq) {
      return NextResponse.json({ ok: false, message: 'RFQ not found' }, { status: 404 })
    }
    if (rfq.userId !== tokenUser.id && tokenUser.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ ok: true, data: rfq })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req)

    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id } })
    if (!rfq) {
      return NextResponse.json({ ok: false, message: 'RFQ not found' }, { status: 404 })
    }
    if (rfq.userId !== tokenUser.id) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const { status } = await req.json()
    if (!status) {
      return NextResponse.json({ ok: false, message: 'status is required' }, { status: 400 })
    }

    const updated = await prisma.rFQ.update({
      where: { id: params.id },
      data: { status },
    })
    return NextResponse.json({ ok: true, data: updated })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req)

    const rfq = await prisma.rFQ.findUnique({ where: { id: params.id } })
    if (!rfq) {
      return NextResponse.json({ ok: false, message: 'RFQ not found' }, { status: 404 })
    }
    if (rfq.userId !== tokenUser.id) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }
    if (rfq.status !== 'OPEN') {
      return NextResponse.json({ ok: false, message: 'Only OPEN RFQs can be deleted' }, { status: 400 })
    }

    await prisma.rFQ.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
