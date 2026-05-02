export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, err, handleError } from '@/lib/api'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        },
      },
    })
    if (!contractor) return err('Contractor not found', 404)
    return ok(contractor)
  } catch (e) { return handleError(e) }
}
