export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '100')

    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500),
    })
    return ok(logs)
  } catch (e) { return handleError(e) }
}
