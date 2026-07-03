import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const feedback = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
    return ok(feedback)
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const { id, status } = await req.json()
    if (!id || !['NEW', 'REVIEWED', 'RESOLVED'].includes(status)) {
      return err('id and a valid status are required')
    }
    const feedback = await prisma.feedback.update({ where: { id }, data: { status } })
    return ok(feedback)
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
    await prisma.feedback.delete({ where: { id } })
    return ok({ deleted: true })
  } catch (e) {
    return handleError(e)
  }
}
