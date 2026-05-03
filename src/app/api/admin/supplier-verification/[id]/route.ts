import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req, ['ADMIN'])

    const supplier = await prisma.supplier.findUnique({ where: { id: params.id } })
    if (!supplier) {
      return NextResponse.json({ ok: false, message: 'Supplier not found' }, { status: 404 })
    }

    const { action, note } = await req.json()
    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ ok: false, message: 'action must be APPROVE or REJECT' }, { status: 400 })
    }

    let updateData: Record<string, unknown>
    if (action === 'APPROVE') {
      updateData = {
        verificationStatus: 'APPROVED',
        verified: true,
        verifiedAt: new Date(),
        verificationNote: note ?? null,
      }
    } else {
      updateData = {
        verificationStatus: 'REJECTED',
        verificationNote: note ?? null,
      }
    }

    const updated = await prisma.supplier.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, verificationStatus: true, verified: true, verifiedAt: true, verificationNote: true },
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
