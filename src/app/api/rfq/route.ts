import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const tokenUser = requireAuth(req)

    const rfqs = await prisma.rFQ.findMany({
      where: { userId: tokenUser.id },
      include: {
        _count: { select: { quotes: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: rfqs })
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
    const tokenUser = requireAuth(req)

    const { title, boqJson, location, deadline } = await req.json()
    if (!title || !boqJson) {
      return NextResponse.json({ ok: false, message: 'title and boqJson are required' }, { status: 400 })
    }

    const rfq = await prisma.rFQ.create({
      data: {
        userId: tokenUser.id,
        title,
        boqJson,
        location,
        deadline: deadline ? new Date(deadline) : undefined,
        status: 'OPEN',
      },
    })
    return NextResponse.json({ ok: true, data: rfq }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
