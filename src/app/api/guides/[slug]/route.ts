import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const tokenUser = getTokenFromRequest(req)
    const isAdmin = tokenUser?.role === 'ADMIN'

    const guide = await prisma.materialGuide.findUnique({
      where: { slug: params.slug },
      include: { material: { select: { id: true, name: true } } },
    })

    if (!guide) {
      return NextResponse.json({ ok: false, message: 'Guide not found' }, { status: 404 })
    }
    if (!guide.published && !isAdmin) {
      return NextResponse.json({ ok: false, message: 'Guide not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: guide })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
