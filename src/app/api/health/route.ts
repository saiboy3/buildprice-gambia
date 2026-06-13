import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [suppliers, materials, prices, contractors] = await Promise.all([
      prisma.supplier.count(),
      prisma.material.count(),
      prisma.price.count(),
      prisma.contractor.count(),
    ])
    return NextResponse.json({
      ok: true,
      status: 'healthy',
      data: { suppliers, materials, prices, contractors },
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json({ ok: false, status: 'db_error', error: String(e) }, { status: 500 })
  }
}
