import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req, ['ADMIN'])

    const existing = await prisma.fraudAlert.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Fraud alert not found' }, { status: 404 })
    }

    const { title, body, severity, active, materialId } = await req.json()

    const alert = await prisma.fraudAlert.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
        ...(severity !== undefined && { severity }),
        ...(active !== undefined && { active }),
        ...(materialId !== undefined && { materialId }),
      },
    })
    return NextResponse.json({ ok: true, data: alert })
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
    requireAuth(req, ['ADMIN'])

    const existing = await prisma.fraudAlert.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Fraud alert not found' }, { status: 404 })
    }

    await prisma.fraudAlert.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
