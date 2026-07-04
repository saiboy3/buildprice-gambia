export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req)
    if (!user || user.role !== 'ADMIN') return err('Forbidden', 403)

    const contractors = await prisma.contractor.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reviews: { select: { id: true } } },
    })
    return ok(contractors)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req)
    if (!user || user.role !== 'ADMIN') return err('Forbidden', 403)

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return err('id required')

    await prisma.contractor.delete({ where: { id } })
    await log('DELETE_CONTRACTOR', user.id, id)
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
