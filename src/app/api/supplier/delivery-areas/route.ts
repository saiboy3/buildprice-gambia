import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const tokenUser = requireAuth(req, ['SUPPLIER'])
    const supplierId = tokenUser.supplierId
    if (!supplierId) {
      return NextResponse.json({ ok: false, message: 'No supplier profile linked' }, { status: 403 })
    }

    const areas = await prisma.deliveryArea.findMany({
      where: { supplierId },
      orderBy: { regionName: 'asc' },
    })
    return NextResponse.json({ ok: true, data: areas })
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
    const tokenUser = requireAuth(req, ['SUPPLIER'])
    const supplierId = tokenUser.supplierId
    if (!supplierId) {
      return NextResponse.json({ ok: false, message: 'No supplier profile linked' }, { status: 403 })
    }

    const { regionName, radiusKm } = await req.json()
    if (!regionName) {
      return NextResponse.json({ ok: false, message: 'regionName is required' }, { status: 400 })
    }

    const area = await prisma.deliveryArea.create({
      data: { supplierId, regionName, radiusKm },
    })
    return NextResponse.json({ ok: true, data: area }, { status: 201 })
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
    const tokenUser = requireAuth(req, ['SUPPLIER'])
    const supplierId = tokenUser.supplierId
    if (!supplierId) {
      return NextResponse.json({ ok: false, message: 'No supplier profile linked' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const areaId = searchParams.get('areaId')
    if (!areaId) {
      return NextResponse.json({ ok: false, message: 'areaId is required' }, { status: 400 })
    }

    const area = await prisma.deliveryArea.findUnique({ where: { id: areaId } })
    if (!area || area.supplierId !== supplierId) {
      return NextResponse.json({ ok: false, message: 'Area not found or forbidden' }, { status: 404 })
    }

    await prisma.deliveryArea.delete({ where: { id: areaId } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
