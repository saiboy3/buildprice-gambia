import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const rates = await prisma.labourRate.findMany({
      orderBy: [{ trade: 'asc' }, { region: 'asc' }],
    })
    return NextResponse.json({ ok: true, data: rates })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const { trade, ratePerDay, unit, region } = await req.json()
    if (!trade || ratePerDay === undefined) {
      return NextResponse.json({ ok: false, message: 'trade and ratePerDay are required' }, { status: 400 })
    }

    const rate = await prisma.labourRate.create({
      data: { trade, ratePerDay, unit, region },
    })
    return NextResponse.json({ ok: true, data: rate }, { status: 201 })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
