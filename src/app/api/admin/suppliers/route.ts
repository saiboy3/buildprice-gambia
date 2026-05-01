import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const suppliers = await prisma.supplier.findMany({
      include: { user: { select: { name: true, phone: true, email: true } }, prices: true },
      orderBy: { createdAt: 'desc' },
    })
    return ok(suppliers)
  } catch (e) { return handleError(e) }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req, ['ADMIN'])
    const { id, verified, name, location, contact } = await req.json()
    if (!id) return err('id required')

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(verified !== undefined ? { verified } : {}),
        ...(name     ? { name }     : {}),
        ...(location ? { location } : {}),
        ...(contact  ? { contact }  : {}),
      },
    })
    await log('UPDATE_SUPPLIER', user.id, `${supplier.name} verified=${supplier.verified}`)
    return ok(supplier)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req, ['ADMIN'])
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return err('id required')

    await prisma.supplier.delete({ where: { id } })
    await log('DELETE_SUPPLIER', user.id, id)
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}
