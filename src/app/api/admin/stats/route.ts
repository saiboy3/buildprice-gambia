import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const [forumThreads, rfqs, publishedGuides, pendingVerifications] = await Promise.all([
      prisma.forumThread.count(),
      prisma.rFQ.count(),
      prisma.materialGuide.count({ where: { published: true } }),
      prisma.supplier.count({ where: { verificationStatus: 'PENDING' } }),
    ])

    return NextResponse.json({
      ok: true,
      data: { forumThreads, rfqs, publishedGuides, pendingVerifications },
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
