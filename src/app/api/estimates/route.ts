export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req)
    const { projectName, location, inputs, results, totalCost } = await req.json()

    if (!projectName || !inputs || !results) return err('projectName, inputs, and results are required')

    const estimate = await prisma.estimate.create({
      data: {
        projectName,
        location: location ?? '',
        inputs:   JSON.stringify(inputs),
        results:  JSON.stringify(results),
        totalCost: totalCost ?? 0,
        userId:   user?.id ?? null,
      },
    })

    return ok({ shareToken: estimate.shareToken, id: estimate.id }, 201)
  } catch (e) { return handleError(e) }
}

export async function GET(req: NextRequest) {
  try {
    const user = getTokenFromRequest(req)
    if (!user) return err('Unauthorized', 401)

    const estimates = await prisma.estimate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, shareToken: true, projectName: true, location: true, totalCost: true, createdAt: true },
    })

    return ok(estimates)
  } catch (e) { return handleError(e) }
}
