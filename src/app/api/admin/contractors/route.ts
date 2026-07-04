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
      include: {
        reviews: { select: { id: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
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
    const deleteUser = searchParams.get('deleteUser') === 'true'

    const contractor = await prisma.contractor.findUnique({ where: { id }, select: { userId: true } })
    if (!contractor) return err('Not found', 404)

    await prisma.contractor.delete({ where: { id } })
    await log('DELETE_CONTRACTOR', user.id, id)

    if (deleteUser && contractor.userId) {
      await prisma.user.delete({ where: { id: contractor.userId } })
      await log('DELETE_USER', user.id, contractor.userId)
    }

    return ok({ deleted: true, userDeleted: deleteUser && !!contractor.userId })
  } catch (e) { return handleError(e) }
}
