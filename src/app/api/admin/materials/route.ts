import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req, ['ADMIN'])
    const materials = await prisma.material.findMany({
      include: { category: true, prices: true },
      orderBy: { name: 'asc' },
    })
    return ok(materials)
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = requireAuth(req, ['ADMIN'])
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return err('id required')

    await prisma.material.delete({ where: { id } })
    await log('DELETE_MATERIAL', user.id, id)
    return ok({ deleted: true })
  } catch (e) { return handleError(e) }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req, ['ADMIN'])
    const { id, name, categoryId } = await req.json()
    if (!id) return err('id required')

    const material = await prisma.material.update({
      where: { id },
      data: { ...(name ? { name } : {}), ...(categoryId ? { categoryId } : {}) },
      include: { category: true },
    })
    await log('UPDATE_MATERIAL', user.id, material.name)
    return ok(material)
  } catch (e) { return handleError(e) }
}
