import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const [reports, leaderboardRaw] = await Promise.all([
      prisma.fieldReport.findMany({
        where: status && status !== 'ALL' ? { status } : undefined,
        include: { material: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 300,
      }),
      prisma.fieldReport.groupBy({
        by: ['reporterPhone', 'reporterName'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
    ])

    const leaderboard = leaderboardRaw.map(l => ({
      phone: l.reporterPhone,
      name: l.reporterName,
      count: l._count.id,
    }))

    return ok({ reports, leaderboard })
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const { id, status, rewardNote } = await req.json()
    if (!id) return err('id is required')
    if (status && !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) return err('Invalid status')

    const report = await prisma.fieldReport.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(rewardNote !== undefined ? { rewardNote } : {}),
      },
    })
    return ok(report)
  } catch (e) {
    return handleError(e)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return err('id is required')
    await prisma.fieldReport.delete({ where: { id } })
    return ok({ deleted: true })
  } catch (e) {
    return handleError(e)
  }
}
