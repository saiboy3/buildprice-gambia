import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'
import { randomBytes } from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const tokenUser = requireAuth(req)

    const keys = await prisma.apiKey.findMany({
      where: { userId: tokenUser.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: keys })
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

    const { label } = await req.json()
    if (!label) {
      return NextResponse.json({ ok: false, message: 'label is required' }, { status: 400 })
    }

    const existingCount = await prisma.apiKey.count({ where: { userId: tokenUser.id } })
    if (existingCount >= 5) {
      return NextResponse.json({ ok: false, message: 'Maximum of 5 API keys allowed' }, { status: 400 })
    }

    const key = `bpg_${randomBytes(32).toString('hex')}`

    const apiKey = await prisma.apiKey.create({
      data: { userId: tokenUser.id, label, key, active: true },
    })
    return NextResponse.json({ ok: true, data: apiKey }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
