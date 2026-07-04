import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'
import { mergeReporters } from '@/lib/fieldReporter'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const reporters = await prisma.fieldReporter.findMany({
      include: {
        phones: { select: { phone: true } },
        reports: { select: { status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
    })

    const data = reporters.map(r => {
      const approved = r.reports.filter(x => x.status === 'APPROVED').length
      const rejected = r.reports.filter(x => x.status === 'REJECTED').length
      const pending  = r.reports.filter(x => x.status === 'PENDING').length
      const reviewed = approved + rejected
      return {
        id: r.id,
        name: r.name,
        rating: r.rating,
        notes: r.notes,
        active: r.active,
        createdAt: r.createdAt,
        phones: r.phones.map(p => p.phone),
        totalReports: r.reports.length,
        approved,
        rejected,
        pending,
        approvalRate: reviewed > 0 ? Math.round((approved / reviewed) * 100) : null,
      }
    })

    // Most active first, so the reporters worth rating surface at the top.
    data.sort((a, b) => b.totalReports - a.totalReports)

    return ok(data)
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const { id, rating, notes, active, name } = await req.json()
    if (!id) return err('id is required')
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return err('rating must be between 0 and 5')
    }

    const reporter = await prisma.fieldReporter.update({
      where: { id },
      data: {
        ...(rating !== undefined ? { rating } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(active !== undefined ? { active } : {}),
        ...(name !== undefined && typeof name === 'string' && name.trim() ? { name: name.trim().slice(0, 100) } : {}),
      },
    })
    return ok(reporter)
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const { intoId, fromId } = await req.json()
    if (!intoId || !fromId) return err('intoId and fromId are required')
    await mergeReporters(intoId, fromId)
    return ok({ merged: true })
  } catch (e) {
    return handleError(e)
  }
}
