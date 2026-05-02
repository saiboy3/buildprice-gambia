export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

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
