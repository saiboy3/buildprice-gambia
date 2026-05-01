import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, err, handleError } from '@/lib/api'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: params.id },
      include: {
        prices: {
          include: { material: { include: { category: true } } },
          orderBy: { updatedAt: 'desc' },
        },
      },
    })

    if (!supplier) return err('Supplier not found', 404)

    // Increment view count
    await prisma.supplier.update({ where: { id: params.id }, data: { views: { increment: 1 } } })

    return ok(supplier)
  } catch (e) {
    return handleError(e)
  }
}
