export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { ok, err, handleError } from '@/lib/api'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const estimate = await prisma.estimate.findUnique({
      where: { shareToken: params.token },
      include: { user: { select: { name: true } } },
    })

    if (!estimate) return err('Estimate not found', 404)

    return ok({
      ...estimate,
      inputs:  JSON.parse(estimate.inputs),
      results: JSON.parse(estimate.results),
    })
  } catch (e) { return handleError(e) }
}
