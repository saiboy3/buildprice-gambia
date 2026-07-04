import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])

    const reporters = await prisma.fieldReporter.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true } },
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
        userId: r.user.id,
        name: r.user.name,
        phone: r.user.phone,
        rating: r.rating,
        notes: r.notes,
        active: r.active,
        createdAt: r.createdAt,
        totalReports: r.reports.length,
        approved,
        rejected,
        pending,
        approvalRate: reviewed > 0 ? Math.round((approved / reviewed) * 100) : null,
      }
    })

    data.sort((a, b) => b.totalReports - a.totalReports)

    return ok(data)
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const { id, rating, notes, active } = await req.json()
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
      },
    })
    return ok(reporter)
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
    const deleteUser = searchParams.get('deleteUser') === 'true'

    const reporter = await prisma.fieldReporter.findUnique({ where: { id }, select: { userId: true } })
    if (!reporter) return err('Not found', 404)

    await prisma.fieldReporter.delete({ where: { id } })

    if (deleteUser && reporter.userId) {
      await prisma.user.delete({ where: { id: reporter.userId } })
    }

    return ok({ deleted: true, userDeleted: deleteUser && !!reporter.userId })
  } catch (e) {
    return handleError(e)
  }
}
