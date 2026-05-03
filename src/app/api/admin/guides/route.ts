import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const guides = await prisma.materialGuide.findMany({
      include: { material: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: guides })
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
    requireAuth(req, ['ADMIN'])

    const { slug, title, content, category, materialId, published } = await req.json()
    if (!slug || !title || !content) {
      return NextResponse.json({ ok: false, message: 'slug, title, and content are required' }, { status: 400 })
    }

    const existing = await prisma.materialGuide.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ ok: false, message: 'A guide with this slug already exists' }, { status: 409 })
    }

    const guide = await prisma.materialGuide.create({
      data: { slug, title, content, category, materialId, published: published ?? false },
    })
    return NextResponse.json({ ok: true, data: guide }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
