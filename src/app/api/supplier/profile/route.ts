import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError, log } from '@/lib/api'

// "My supplier profile" — scoped to the authenticated user, so the wizard
// never needs to already know a supplierId. Returns null (not an error) if
// the user hasn't created a profile yet, which the wizard treats as
// "first-time setup" vs "editing an existing profile".
export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req, ['SUPPLIER', 'ADMIN'])
    const supplier = await prisma.supplier.findUnique({ where: { userId: user.id } })
    return ok(supplier)
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = requireAuth(req, ['SUPPLIER', 'ADMIN'])
    const { name, location, contact } = await req.json()
    if (!name || !location || !contact) return err('name, location, and contact are required')

    const existing = await prisma.supplier.findUnique({ where: { userId: user.id } })
    if (existing) return err('Supplier profile already exists', 409)

    const supplier = await prisma.supplier.create({
      data: { name: name.slice(0, 100), location: location.slice(0, 100), contact: contact.slice(0, 50), userId: user.id },
    })
    await log('CREATE_SUPPLIER', user.id, supplier.name)
    return ok(supplier, 201)
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = requireAuth(req, ['SUPPLIER', 'ADMIN'])
    const { name, location, contact } = await req.json()

    const existing = await prisma.supplier.findUnique({ where: { userId: user.id } })
    if (!existing) return err('No supplier profile yet — create one first', 404)

    const supplier = await prisma.supplier.update({
      where: { id: existing.id },
      data: {
        ...(name ? { name: name.slice(0, 100) } : {}),
        ...(location ? { location: location.slice(0, 100) } : {}),
        ...(contact ? { contact: contact.slice(0, 50) } : {}),
      },
    })
    await log('UPDATE_SUPPLIER_PROFILE', user.id, supplier.name)
    return ok(supplier)
  } catch (e) {
    return handleError(e)
  }
}
