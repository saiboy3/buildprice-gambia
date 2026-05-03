import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contractor = await prisma.contractor.findUnique({ where: { id: params.id } })
    if (!contractor) {
      return NextResponse.json({ ok: false, message: 'Contractor not found' }, { status: 404 })
    }

    const { name, phone, message, projectType } = await req.json()
    if (!name || !phone || !message) {
      return NextResponse.json({ ok: false, message: 'name, phone, and message are required' }, { status: 400 })
    }

    const lead = await prisma.contractorLead.create({
      data: {
        contractorId: params.id,
        name,
        phone,
        message,
        projectType,
        status: 'NEW',
      },
    })
    return NextResponse.json({ ok: true, data: lead }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
