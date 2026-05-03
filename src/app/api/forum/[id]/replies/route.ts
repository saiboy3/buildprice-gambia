import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const replies = await prisma.forumReply.findMany({
      where: { threadId: params.id },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ ok: true, data: replies })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req)

    const thread = await prisma.forumThread.findUnique({ where: { id: params.id } })
    if (!thread) {
      return NextResponse.json({ ok: false, message: 'Thread not found' }, { status: 404 })
    }

    const { body } = await req.json()
    if (!body) {
      return NextResponse.json({ ok: false, message: 'body is required' }, { status: 400 })
    }

    const reply = await prisma.forumReply.create({
      data: { threadId: params.id, userId: tokenUser.id, body },
      include: { user: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ ok: true, data: reply }, { status: 201 })
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

    const { searchParams } = new URL(req.url)
    const replyId = searchParams.get('replyId')
    if (!replyId) {
      return NextResponse.json({ ok: false, message: 'replyId is required' }, { status: 400 })
    }

    const reply = await prisma.forumReply.findUnique({ where: { id: replyId } })
    if (!reply || reply.threadId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Reply not found' }, { status: 404 })
    }
    if (reply.userId !== tokenUser.id && tokenUser.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    await prisma.forumReply.delete({ where: { id: replyId } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
