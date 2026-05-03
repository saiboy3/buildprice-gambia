import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req, ['ADMIN'])

    const { trade, ratePerDay, unit, region } = await req.json()

    const existing = await prisma.labourRate.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Labour rate not found' }, { status: 404 })
    }

    const rate = await prisma.labourRate.update({
      where: { id: params.id },
      data: {
        ...(trade !== undefined && { trade }),
        ...(ratePerDay !== undefined && { ratePerDay }),
        ...(unit !== undefined && { unit }),
        ...(region !== undefined && { region }),
      },
    })
    return NextResponse.json({ ok: true, data: rate })
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

    const existing = await prisma.labourRate.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Labour rate not found' }, { status: 404 })
    }

    await prisma.labourRate.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
