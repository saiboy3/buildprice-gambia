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

    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } })
    if (!supplier) {
      return NextResponse.json({ ok: false, message: 'Supplier not found' }, { status: 404 })
    }

    const [priceAgg, topMaterials, recentHistory] = await Promise.all([
      prisma.price.aggregate({
        where: { supplierId },
        _count: { id: true },
        _avg: { price: true },
      }),
      prisma.price.groupBy({
        by: ['materialId'],
        where: { supplierId },
        _count: { id: true },
        _avg: { price: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      prisma.priceHistory.findMany({
        where: { supplierId },
        orderBy: { changedAt: 'desc' },
        take: 10,
        include: { material: { select: { name: true } } },
      }),
    ])

    // Resolve material names for topMaterials
    const materialIds = topMaterials.map((m) => m.materialId)
    const materials = await prisma.material.findMany({
      where: { id: { in: materialIds } },
      select: { id: true, name: true },
    })
    const materialMap = Object.fromEntries(materials.map((m) => [m.id, m.name]))

    const topMaterialsWithNames = topMaterials.map((m) => ({
      name: materialMap[m.materialId] ?? m.materialId,
      priceCount: m._count.id,
      avgPrice: m._avg.price ?? 0,
    }))

    return NextResponse.json({
      ok: true,
      data: {
        totalViews: supplier.views ?? 0,
        totalInquiries: supplier.inquiries ?? 0,
        priceCount: priceAgg._count.id,
        avgPrice: priceAgg._avg.price ?? 0,
        topMaterials: topMaterialsWithNames,
        recentHistory,
        reviewCount: supplier.reviewCount ?? 0,
        avgRating: supplier.avgRating ?? 0,
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
