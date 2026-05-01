export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, err, handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const materialId  = searchParams.get('material_id') ?? ''
    const supplierId  = searchParams.get('supplier_id') ?? ''
    const location    = searchParams.get('location') ?? ''
    const minPrice    = parseFloat(searchParams.get('min_price') ?? '0') || 0
    const maxPrice    = parseFloat(searchParams.get('max_price') ?? '0') || 0

    const prices = await prisma.price.findMany({
      where: {
        ...(materialId ? { materialId } : {}),
        ...(supplierId ? { supplierId } : {}),
        ...(location   ? { supplier: { location: { contains: location } } } : {}),
        ...(minPrice   ? { price: { gte: minPrice } } : {}),
        ...(maxPrice   ? { price: { lte: maxPrice } } : {}),
      },
      include: {
        material: { include: { category: true } },
        supplier: { select: { id: true, name: true, location: true, contact: true, verified: true } },
      },
      orderBy: { price: 'asc' },
    })

    return ok(prices)
  } catch (e) {
    return handleError(e)
  }
}
