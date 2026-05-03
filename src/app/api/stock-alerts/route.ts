import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const tokenUser = requireAuth(req)

    const alerts = await prisma.stockAlert.findMany({
      where: { userId: tokenUser.id, active: true },
      include: {
        material: { select: { id: true, name: true, category: { select: { name: true } } } },
        supplier: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: alerts })
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
    const tokenUser = requireAuth(req)

    const { materialId, supplierId } = await req.json()
    if (!materialId) {
      return NextResponse.json({ ok: false, message: 'materialId is required' }, { status: 400 })
    }

    const sid: string | null = supplierId ?? null

    // Use findFirst + create/update to avoid compound null key issues
    const existing = await prisma.stockAlert.findFirst({
      where: { userId: tokenUser.id, materialId, supplierId: sid },
    })

    let alert
    if (existing) {
      alert = await prisma.stockAlert.update({
        where: { id: existing.id },
        data: { active: true },
      })
    } else {
      alert = await prisma.stockAlert.create({
        data: { userId: tokenUser.id, materialId, supplierId: sid, active: true },
      })
    }

    return NextResponse.json({ ok: true, data: alert }, { status: 201 })
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
    const tokenUser = requireAuth(req)

    const { searchParams } = new URL(req.url)
    const materialId = searchParams.get('materialId')
    const supplierId: string | null = searchParams.get('supplierId') ?? null

    if (!materialId) {
      return NextResponse.json({ ok: false, message: 'materialId is required' }, { status: 400 })
    }

    const alert = await prisma.stockAlert.findFirst({
      where: { userId: tokenUser.id, materialId, supplierId },
    })

    if (!alert) {
      return NextResponse.json({ ok: false, message: 'Alert not found' }, { status: 404 })
    }

    await prisma.stockAlert.update({
      where: { id: alert.id },
      data: { active: false },
    })

    return NextResponse.json({ ok: true, data: { deactivated: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
