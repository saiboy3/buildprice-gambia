import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const threads = await prisma.forumThread.findMany({
      where: category ? { categorySlug: category } : undefined,
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ ok: true, data: threads })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const tokenUser = requireAuth(req)

    const { title, body, categorySlug } = await req.json()
    if (!title || !body) {
      return NextResponse.json({ ok: false, message: 'title and body are required' }, { status: 400 })
    }

    const thread = await prisma.forumThread.create({
      data: {
        userId: tokenUser.id,
        title,
        body,
        categorySlug,
        pinned: false,
        views: 0,
      },
      include: { user: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ ok: true, data: thread }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
