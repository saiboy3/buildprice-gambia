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

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { verificationStatus: true, verificationNote: true, verifiedAt: true },
    })
    if (!supplier) {
      return NextResponse.json({ ok: false, message: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: supplier })
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

    const { docUrls } = await req.json()
    if (!Array.isArray(docUrls) || docUrls.length === 0) {
      return NextResponse.json({ ok: false, message: 'docUrls must be a non-empty array' }, { status: 400 })
    }

    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        verificationStatus: 'PENDING',
        verificationDocs: JSON.stringify(docUrls),
      },
      select: { verificationStatus: true, verificationNote: true, verifiedAt: true },
    })
    return NextResponse.json({ ok: true, data: supplier })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
