import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const users = await prisma.user.findMany({
      select: { id: true, name: true, phone: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    return ok(users)
  } catch (e) { return handleError(e) }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = requireAuth(req, ['ADMIN'])
    const { id, role } = await req.json()
    if (!id || !role) return err('id and role required')
    if (!['USER', 'SUPPLIER', 'ADMIN'].includes(role)) return err('Invalid role')

    const user = await prisma.user.update({ where: { id }, data: { role } })
    await log('UPDATE_USER_ROLE', admin.id, `${user.phone} → ${role}`)
    return ok({ id: user.id, role: user.role })
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = requireAuth(req, ['ADMIN'])
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return err('id required')
    if (id === admin.id) return err('Cannot delete yourself', 400)

    await prisma.user.delete({ where: { id } })
    await log('DELETE_USER', admin.id, id)
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
