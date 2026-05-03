import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const tokenUser = requireAuth(req, ['SUPPLIER'])
    const supplierId = tokenUser.supplierId
    if (!supplierId) {
      return NextResponse.json({ ok: false, message: 'No supplier profile linked' }, { status: 403 })
    }

    const prices = await prisma.price.findMany({
      where: { supplierId },
      include: {
        material: { include: { category: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const header = 'materialName,category,price,unit,stockStatus,updatedAt\n'
    const rows = prices.map((p) => {
      const materialName = p.material.name.replace(/"/g, '""')
      const category = (p.material.category?.name ?? '').replace(/"/g, '""')
      const updatedAt = p.updatedAt.toISOString()
      return `"${materialName}","${category}",${p.price},"${p.unit}","${p.stockStatus}","${updatedAt}"`
    })
    const csv = header + rows.join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="prices.csv"',
      },
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json({ ok: false, message: e.message }, { status: e.status })
    }
    console.error(e)
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 })
  }
}
