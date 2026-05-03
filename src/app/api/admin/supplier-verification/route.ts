import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const suppliers = await prisma.supplier.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ ok: true, data: suppliers })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
