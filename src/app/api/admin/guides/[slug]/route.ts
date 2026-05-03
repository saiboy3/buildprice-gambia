import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    requireAuth(req, ['ADMIN'])

    const existing = await prisma.materialGuide.findUnique({ where: { slug: params.slug } })
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Guide not found' }, { status: 404 })
    }

    const { slug, title, content, category, materialId, published } = await req.json()

    const guide = await prisma.materialGuide.update({
      where: { slug: params.slug },
      data: {
        ...(slug !== undefined && { slug }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(materialId !== undefined && { materialId }),
        ...(published !== undefined && { published }),
      },
    })
    return NextResponse.json({ ok: true, data: guide })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    requireAuth(req, ['ADMIN'])

    const existing = await prisma.materialGuide.findUnique({ where: { slug: params.slug } })
    if (!existing) {
      return NextResponse.json({ ok: false, message: 'Guide not found' }, { status: 404 })
    }

    await prisma.materialGuide.delete({ where: { slug: params.slug } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
