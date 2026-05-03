import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const listings = await prisma.promotedListing.findMany({
      include: {
        supplier: { select: { id: true, name: true, location: true } },
      },
      orderBy: { startsAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: listings })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const { supplierId, placement, startsAt, endsAt } = await req.json()
    if (!supplierId || !startsAt || !endsAt) {
      return NextResponse.json({ ok: false, message: 'supplierId, startsAt, and endsAt are required' }, { status: 400 })
    }

    const listing = await prisma.promotedListing.create({
      data: {
        supplierId,
        placement,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
      },
    })
    return NextResponse.json({ ok: true, data: listing }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ ok: false, message: 'id is required' }, { status: 400 })
    }

    const listing = await prisma.promotedListing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ ok: false, message: 'Listing not found' }, { status: 404 })
    }

    await prisma.promotedListing.delete({ where: { id } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
