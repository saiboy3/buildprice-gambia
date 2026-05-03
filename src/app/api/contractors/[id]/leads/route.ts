import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req, ['CONTRACTOR'])

    if (tokenUser.contractorId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const leads = await prisma.contractorLead.findMany({
      where: { contractorId: params.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, data: leads })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tokenUser = requireAuth(req, ['CONTRACTOR'])

    if (tokenUser.contractorId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
    }

    const { leadId, status } = await req.json()
    if (!leadId || !status) {
      return NextResponse.json({ ok: false, message: 'leadId and status are required' }, { status: 400 })
    }
    if (!['NEW', 'CONTACTED', 'CLOSED'].includes(status)) {
      return NextResponse.json({ ok: false, message: 'status must be NEW, CONTACTED, or CLOSED' }, { status: 400 })
    }

    const lead = await prisma.contractorLead.findUnique({ where: { id: leadId } })
    if (!lead || lead.contractorId !== params.id) {
      return NextResponse.json({ ok: false, message: 'Lead not found or forbidden' }, { status: 404 })
    }

    const updated = await prisma.contractorLead.update({
      where: { id: leadId },
      data: { status },
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
