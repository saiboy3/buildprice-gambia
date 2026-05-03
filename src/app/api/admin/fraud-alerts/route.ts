import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const alerts = await prisma.fraudAlert.findMany({
      include: { material: { select: { id: true, name: true } } },
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
    const tokenUser = requireAuth(req, ['ADMIN'])

    const { title, body, severity, materialId, active } = await req.json()
    if (!title || !body) {
      return NextResponse.json({ ok: false, message: 'title and body are required' }, { status: 400 })
    }

    const alert = await prisma.fraudAlert.create({
      data: {
        title,
        body,
        severity,
        materialId,
        active: active ?? true,
        adminId: tokenUser.id,
      },
    })
    return NextResponse.json({ ok: true, data: alert }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
