import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req)

    const apiKey = await prisma.apiKey.findUnique({ where: { id: params.id } })
    if (!apiKey || apiKey.userId !== tokenUser.id) {
      return NextResponse.json({ ok: false, message: 'API key not found or forbidden' }, { status: 404 })
    }

    const { active } = await req.json()
    if (active === undefined) {
      return NextResponse.json({ ok: false, message: 'active is required' }, { status: 400 })
    }

    const updated = await prisma.apiKey.update({
      where: { id: params.id },
      data: { active },
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

    const apiKey = await prisma.apiKey.findUnique({ where: { id: params.id } })
    if (!apiKey || apiKey.userId !== tokenUser.id) {
      return NextResponse.json({ ok: false, message: 'API key not found or forbidden' }, { status: 404 })
    }

    await prisma.apiKey.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true, data: { deleted: true } })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
