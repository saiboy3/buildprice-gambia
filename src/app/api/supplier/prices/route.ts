import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'
import { checkAndFireAlerts } from '@/lib/alerts'
import { getMySupplierId } from '@/lib/supplierAuth'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ['SUPPLIER', 'ADMIN'])
    const supplierId = await getMySupplierId(user.id)
    if (!supplierId) return err('No supplier profile linked to this account', 403)

    const prices = await prisma.price.findMany({
      where: { supplierId },
      include: { material: { include: { category: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    return ok(prices)
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ['SUPPLIER', 'ADMIN'])
    const supplierId = await getMySupplierId(user.id)
    if (!supplierId) return err('No supplier profile', 403)

    const body = await req.json()
    const items = Array.isArray(body?.items) ? body.items : [body]

    const results = []
    for (const item of items) {
      const { materialId, price, unit, stockStatus } = item
      if (!materialId || price === undefined || !unit) return err('materialId, price, and unit required')
      if (price < 0) return err('Price must be non-negative')

      // Check for existing price to log history on update
      const existingPrice = await prisma.price.findUnique({
        where: { materialId_supplierId: { materialId, supplierId } },
      })

      if (existingPrice && existingPrice.price !== price) {
        await prisma.priceHistory.create({
          data: {
            priceId: existingPrice.id,
            materialId: existingPrice.materialId,
            supplierId,
            oldPrice: existingPrice.price,
            newPrice: price,
            unit: unit ?? existingPrice.unit,
          },
        })
      }

      const record = await prisma.price.upsert({
        where: { materialId_supplierId: { materialId, supplierId } },
        update: { price, unit, stockStatus: stockStatus ?? 'AVAILABLE' },
        create: { materialId, supplierId, price, unit, stockStatus: stockStatus ?? 'AVAILABLE' },
        include: { material: true },
      })

      await log('UPDATE_PRICE', user.id, `${record.material.name}: D${price}/${unit}`)
      await checkAndFireAlerts(materialId, price)
      results.push(record)
    }

    return ok(Array.isArray(body?.items) ? results : results[0])
  } catch (e) {
    return handleError(e)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req, ['SUPPLIER', 'ADMIN'])
    const supplierId = await getMySupplierId(user.id)
    if (!supplierId) return err('No supplier profile', 403)

    const { searchParams } = new URL(req.url)
    const priceId = searchParams.get('id')
    if (!priceId) return err('id required')

    const price = await prisma.price.findUnique({ where: { id: priceId } })
    if (!price || price.supplierId !== supplierId) return err('Not found or forbidden', 404)

    await prisma.price.delete({ where: { id: priceId } })
    await log('DELETE_PRICE', user.id, priceId)
    return ok({ deleted: true })
  } catch (e) {
    return handleError(e)
  }
}
