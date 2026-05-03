import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, getTokenFromRequest, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const thread = await prisma.forumThread.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true } },
        replies: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!thread) {
      return NextResponse.json({ ok: false, message: 'Thread not found' }, { status: 404 })
    }

    // Increment views
    await prisma.forumThread.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ ok: true, data: thread })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req, ['ADMIN'])

    const { pinned } = await req.json()
    if (pinned === undefined) {
      return NextResponse.json({ ok: false, message: 'pinned is required' }, { status: 400 })
    }

    const thread = await prisma.forumThread.findUnique({ where: { id: params.id } })
    if (!thread) {
      return NextResponse.json({ ok: false, message: 'Thread not found' }, { status: 404 })
    }

    const updated = await prisma.forumThread.update({
      where: { id: params.id },
      data: { pinned },
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req)

    const thread = await prisma.forumThread.findUnique({ where: { id: params.id } })
    if (!thread) {
      return NextResponse.json({ ok: false, message: 'Thread not found' }, { status: 404 })
    }
    if (thread.userId !== tokenUser.id && tokenUser.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    await prisma.forumThread.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
