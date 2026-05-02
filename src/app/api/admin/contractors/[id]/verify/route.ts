export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getTokenFromRequest(req)
    if (!user || user.role !== 'ADMIN') return err('Forbidden', 403)

    const { verified } = await req.json() as { verified: boolean }

    const contractor = await prisma.contractor.update({
      where: { id: params.id },
      data:  { verified, verifiedAt: verified ? new Date() : null },
    })

    await log(verified ? 'CONTRACTOR_VERIFIED' : 'CONTRACTOR_UNVERIFIED',
      `${contractor.name} — by admin ${user.id}`, user.id)

    return ok(contractor)
  } catch (e) { return handleError(e) }
}
