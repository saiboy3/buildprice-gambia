import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)

    const alerts = await prisma.alert.findMany({
      where: { userId: user.id },
      include: { material: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return ok(alerts)
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { materialId, targetPrice } = await req.json()

    if (!materialId || targetPrice === undefined) return err('materialId and targetPrice required')
    if (targetPrice <= 0) return err('targetPrice must be positive')

    const material = await prisma.material.findUnique({ where: { id: materialId } })
    if (!material) return err('Material not found', 404)

    const alert = await prisma.alert.create({
      data: { userId: user.id, materialId, targetPrice },
      include: { material: true },
    })

    return ok(alert, 201)
  } catch (e) {
    return handleError(e)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return err('id required')

    const alert = await prisma.alert.findUnique({ where: { id } })
    if (!alert || alert.userId !== user.id) return err('Not found', 404)

    await prisma.alert.delete({ where: { id } })
    return ok({ deleted: true })
  } catch (e) {
    return handleError(e)
  }
}
