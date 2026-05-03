import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const discounts = await prisma.bulkDiscount.findMany({
      where: { priceId: params.id },
      orderBy: { minQty: 'asc' },
    })
    return NextResponse.json({ ok: true, data: discounts })
  } catch (e) {
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

    const price = await prisma.price.findUnique({ where: { id: params.id } })
    if (!price) {
      return NextResponse.json({ ok: false, message: 'Price not found' }, { status: 404 })
    }
    if (price.supplierId !== supplierId) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const { minQty, discountPct, note } = await req.json()
    if (minQty === undefined || discountPct === undefined) {
      return NextResponse.json({ ok: false, message: 'minQty and discountPct are required' }, { status: 400 })
    }

    const discount = await prisma.bulkDiscount.create({
      data: { priceId: params.id, minQty, discountPct, note },
    })
    return NextResponse.json({ ok: true, data: discount }, { status: 201 })
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
    const tokenUser = requireAuth(req, ['SUPPLIER', 'ADMIN'])
    const supplierId = tokenUser.supplierId
    if (!supplierId) {
      return NextResponse.json({ ok: false, message: 'No supplier profile linked' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const discountId = searchParams.get('discountId')
    if (!discountId) {
      return NextResponse.json({ ok: false, message: 'discountId is required' }, { status: 400 })
    }

    const discount = await prisma.bulkDiscount.findUnique({
      where: { id: discountId },
      include: { price: true },
    })
    if (!discount || discount.priceId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Discount not found' }, { status: 404 })
    }
    if (discount.price.supplierId !== supplierId) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    await prisma.bulkDiscount.delete({ where: { id: discountId } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
