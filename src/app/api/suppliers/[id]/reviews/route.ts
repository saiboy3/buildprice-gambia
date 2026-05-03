import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest, AuthError } from '@/lib/auth'

async function recalcSupplierRating(supplierId: string) {
  const agg = await prisma.supplierReview.aggregate({
    where: { supplierId },
    _avg: { rating: true },
    _count: { id: true },
  })
  await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count.id,
    },
  })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!supplier) {
      return NextResponse.json({ ok: false, message: 'Supplier not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: supplier.reviews })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = getTokenFromRequest(req)
    if (!tokenUser) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    const supplierId = params.id
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } })
    if (!supplier) {
      return NextResponse.json({ ok: false, message: 'Supplier not found' }, { status: 404 })
    }

    const { rating, comment } = await req.json()
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, message: 'rating must be between 1 and 5' }, { status: 400 })
    }

    const review = await prisma.supplierReview.upsert({
      where: { supplierId_userId: { supplierId, userId: tokenUser.id } },
      update: { rating, comment },
      create: { supplierId, userId: tokenUser.id, rating, comment },
      include: { user: { select: { id: true, name: true } } },
    })

    await recalcSupplierRating(supplierId)

    return NextResponse.json({ ok: true, data: review }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = getTokenFromRequest(req)
    if (!tokenUser) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    }

    const supplierId = params.id
    const review = await prisma.supplierReview.findUnique({
      where: { supplierId_userId: { supplierId, userId: tokenUser.id } },
    })
    if (!review) {
      return NextResponse.json({ ok: false, message: 'Review not found' }, { status: 404 })
    }

    await prisma.supplierReview.delete({
      where: { supplierId_userId: { supplierId, userId: tokenUser.id } },
    })

    await recalcSupplierRating(supplierId)

    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
